import type {
  NextFunction,
  Request,
  RequestHandler,
  Response,
  WebSocket,
} from "../../../deps.ts";
import { acceptWebSocket, isWebSocketCloseEvent } from "../../../deps.ts";
import { FileWatcher } from "../../fileWatcher.ts";
import { ModuleGraph } from "../../moduleGraph.ts";
import { WebSocketServer } from "../../webSocketServer.ts";
import { getLmrClient } from "../getLmrClient.ts";
import { isHtmlExtension } from "../isHtml.ts";
import { stripUrl } from "../stripUrl.ts";
import { pathToId } from "../pathToId.ts";

const RE_LMR_WS = /\/\$luath\/lmr($|\?|&|#)/;
const RE_LMR_JS = /\/\$luath\/client\.js($|\?|&|#)/;

const isLmrWs = (fileName: string) => RE_LMR_WS.test(fileName);
const isLmrJs = (fileName: string) => RE_LMR_JS.test(fileName);

const invalidatedModules = new Set();

export function lmr(
  rootDir: string,
  fileWatcher: FileWatcher,
  webSocketServer: WebSocketServer,
  moduleGraph: ModuleGraph,
): RequestHandler {
  async function handleWebSocketMessage(socket: WebSocket) {
    webSocketServer.register(socket);

    for await (const message of socket) {
      try {
        if (socket.isClosed) {
          break;
        } else if (isWebSocketCloseEvent(message)) {
          break;
        } else if (typeof message === "string") {
          const data = JSON.parse(message);

          switch (data.type) {
            case "hotAccepted": {
              const id = stripUrl(data.id);
              const mod = moduleGraph.ensure(id);
              mod.acceptingUpdates = true;

              break;
            }
          }
        }
      } catch (_) {
        break;
      }
    }

    await webSocketServer.unregister(socket);
  }

  function updateModuleSubGraph(id: string, mtime: number): boolean {
    const mod = moduleGraph.get(id);

    if (!mod) {
      return true;
    }

    mod.stale = true;
    mod.mtime = mtime;

    if (mod.acceptingUpdates) {
      invalidatedModules.add(id);
    }

    if (mod.dependents.size) {
      return !Array.from(mod.dependents).every(
        (subModulePath) =>
          !updateModuleSubGraph(subModulePath as string, mtime),
      );
    }

    return !invalidatedModules.size;
  }

  fileWatcher.on("create", (path: string) => {
    const id = pathToId(path, rootDir);
    moduleGraph.ensure(id);
  });

  fileWatcher.on("modify", (path: string) => {
    const id = pathToId(path, rootDir);
    const mtime = +new Date();

    if (isHtmlExtension(path)) {
      webSocketServer.send({ type: "reload" });

      return;
    }

    const shouldReload = updateModuleSubGraph(id, mtime);

    if (shouldReload) {
      webSocketServer.send({ type: "reload" });
    } else {
      webSocketServer.send({
        type: "update",
        mtime,
        changes: Array.from(invalidatedModules),
      });
    }

    invalidatedModules.clear();
  });

  // TODO: harden this
  fileWatcher.on("remove", (path: string) => {
    const id = pathToId(path, rootDir);
    const mtime = +new Date();
    moduleGraph.delete(id);

    const shouldReload = updateModuleSubGraph(id, mtime);

    if (shouldReload) {
      webSocketServer.send({ type: "reload" });
    } else {
      webSocketServer.send({
        type: "update",
        mtime,
        changes: Array.from(invalidatedModules),
      });
    }

    invalidatedModules.clear();
  });

  fileWatcher.watch();

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (isLmrWs(req.url)) {
        const socket = await acceptWebSocket({
          conn: req.conn,
          bufReader: req.r,
          bufWriter: req.w,
          headers: req.headers,
        });

        handleWebSocketMessage(socket);

        return;
      } else if (isLmrJs(req.url)) {
        res.type(".js").send(await getLmrClient());

        return;
      }

      next();
    } catch (e) {
      next(e);
    }
  };
}

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
import { stripUrl } from "../../stripUrl.ts";
import { pathToId } from "../../pathToId.ts";
import { getLmrClient } from "../getLmrClient.ts";
import { isHtmlExtension } from "../isHtml.ts";

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
  async function handleWebSocketMessage(socketPromise: Promise<WebSocket>) {
    const socket = await socketPromise;

    webSocketServer.register(socket);

    for await (const message of socket) {
      try {
        if (socket.isClosed) {
          break;
        } else if (isWebSocketCloseEvent(message)) {
          break;
        } else if (typeof message === "string") {
          const data = JSON.parse(message);

          if (data.type === "hotAccepted") {
            const mod = moduleGraph.ensure(stripUrl(data.id));
            mod.acceptingUpdates = true;
          }
        }
      } catch (_) {
        break;
      }
    }

    webSocketServer.unregister(socket);
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
    const mtime = +new Date();

    moduleGraph.ensure(id);

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

  fileWatcher.on("remove", (path: string) => {
    const id = pathToId(path, rootDir);
    const mtime = +new Date();

    const shouldReload = updateModuleSubGraph(id, mtime);
    moduleGraph.delete(id);
    invalidatedModules.delete(id);

    if (shouldReload) {
      webSocketServer.send({ type: "reload" });
    } else {
      webSocketServer.send({
        type: "remove",
        changes: [id],
      });
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
    if (isLmrWs(req.url)) {
      handleWebSocketMessage(acceptWebSocket({
        conn: req.conn,
        bufReader: req.r,
        bufWriter: req.w,
        headers: req.headers,
      }));

      return;
    } else if (isLmrJs(req.url)) {
      return res.type(".js")
        .set("Cache-Control", "max-age=31536000,immutable")
        .end(await getLmrClient());
    }

    next();
  };
}

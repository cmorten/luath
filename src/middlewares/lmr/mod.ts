import type { RequestHandler, WebSocket } from "../../../deps.ts";
import {
  acceptWebSocket,
  isWebSocketCloseEvent,
  posix,
} from "../../../deps.ts";
import { FileWatcher } from "../../fileWatcher.ts";
import { ModuleGraph } from "../../moduleGraph.ts";
import { WebSocketServer } from "../../webSocketServer.ts";
import { getLmrClient } from "../getLmrClient.ts";
import { isHtmlExtension } from "../isHtml.ts";
import { stripUrl } from "../stripUrl.ts";

const RE_LMR_WS = /_lmr($|\?)/;
const RE_LMR_JS = /_lmr\.js($|\?)/;

const isLmrWs = (fileName: string) => RE_LMR_WS.test(fileName);
const isLmrJs = (fileName: string) => RE_LMR_JS.test(fileName);

const pathToId = (path: string) => posix.normalize(`/${path}`);

const invalidatedModules = new Set();

export function lmr(
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

  function updateModuleSubGraph(id: string): boolean {
    const mod = moduleGraph.get(id);

    if (!mod) {
      return true;
    }

    mod.stale = true;

    if (mod.acceptingUpdates) {
      invalidatedModules.add(id);

      return false;
    }

    if (mod.dependents.size) {
      return !Array.from(mod.dependents).every(
        (subModulePath) => !updateModuleSubGraph(subModulePath),
      );
    }

    return true;
  }

  fileWatcher.watch();

  fileWatcher.on("create", (path: string) => {
    const id = pathToId(path);
    moduleGraph.ensure(id);
  });

  fileWatcher.on("modify", (path: string) => {
    const id = pathToId(path);

    if (isHtmlExtension(path)) {
      webSocketServer.send({ type: "reload" });

      return;
    }

    const shouldReload = updateModuleSubGraph(id);

    if (shouldReload) {
      webSocketServer.send({ type: "reload" });
    } else {
      webSocketServer.send({
        type: "update",
        changes: Array.from(invalidatedModules),
      });

      invalidatedModules.clear();
    }
  });

  fileWatcher.on("remove", (path: string) => {
    const id = pathToId(path);
    moduleGraph.delete(id);
  });

  return async (req, res, next) => {
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
        res.type("application/javascript").send(await getLmrClient());

        return;
      }

      next();
    } catch (e) {
      next(e);
    }
  };
}

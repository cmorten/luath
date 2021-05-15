import type { LuathOptions } from "./types.ts";
import { join, opine } from "../deps.ts";
import { resolveOptions } from "./resolveOptions.ts";
import {
  error,
  favicon,
  indexHtml,
  lmr,
  notFound,
  servePublic,
  serveStatic,
  transform,
} from "./middlewares/mod.ts";
import { FileWatcher } from "./fileWatcher.ts";
import { ModuleGraph } from "./moduleGraph.ts";
import { WebSocketServer } from "./webSocketServer.ts";
import { precache } from "./precache.ts";

/**
 * server
 *
 * @param {LuathOptions} options
 * @public
 */
export async function server(options?: LuathOptions) {
  const config = resolveOptions(options);
  const moduleGraph = new ModuleGraph();

  // Precache
  await precache(config.root, moduleGraph, config.plugins);

  const publicDir = join(config.root, "public");
  const fileWatcher = new FileWatcher(config.root, {});
  const webSocketServer = new WebSocketServer();

  const app = opine();

  // LMR
  app.use(lmr(config.root, fileWatcher, webSocketServer, moduleGraph));

  // serve static public
  app.use(servePublic(publicDir));

  // transform
  app.use(transform(config.root, moduleGraph, config.plugins));

  // serve static
  app.use(serveStatic(config.root));

  // transform index.html
  app.use(indexHtml(config.root, moduleGraph, config.plugins));

  // placeholder favicon
  app.use(favicon());

  // handle 404s
  app.use(notFound());

  // error handler
  app.use(error(webSocketServer));

  // listen
  const _server = app.listen(config.server);
  const closeServer = _server.close;

  _server.close = () => {
    fileWatcher.close();
    webSocketServer.close();
    closeServer();
  };

  const { hostname, port } = _server.listener.addr as Deno.NetAddr;
  console.info(`listening on http://${hostname}:${port}`);

  return _server;
}

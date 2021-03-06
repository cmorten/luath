import type { LuathOptions } from "./types.ts";
import type { Service } from "../deps.ts";
import { esbuildStartService, join, opine } from "../deps.ts";
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

/**
 * server
 * 
 * @param {LuathOptions} options
 * @param {Number} port
 * @public
 */
export function server(options?: LuathOptions) {
  const config = resolveOptions(options);
  const rootDir = Deno.cwd();
  const publicDir = join(rootDir, "public");

  const app = opine();

  const fileWatcher = new FileWatcher(rootDir, {});
  const webSocketServer = new WebSocketServer();
  const moduleGraph = new ModuleGraph();

  const esbuildService = esbuildStartService({
    worker: false,
    wasmURL: "https://esm.sh/esbuild-wasm@0.8.51/esbuild.wasm",
  });

  // LMR
  app.use(lmr(rootDir, fileWatcher, webSocketServer, moduleGraph));

  // serve static public
  app.use(servePublic(publicDir));

  // transform
  app.use(transform(rootDir, moduleGraph, esbuildService));

  // serve static
  app.use(serveStatic(rootDir));

  // transform index.html
  app.use(indexHtml(rootDir));

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
    esbuildService.then((service: Service) => service.stop());
    fileWatcher.close();
    webSocketServer.close();
    closeServer();
  };

  const { hostname, port } = _server.listener.addr as Deno.NetAddr;
  console.info(`listening on http://${hostname}:${port}`);

  return _server;
}

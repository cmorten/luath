import type { LuathOptions } from "./types.ts";
import { esbuildStartService, join, opine, v4 } from "../deps.ts";
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

const blobURLMap = new Map();

function createObjectURL(blob: any) {
  const origin = "http://deno-opaque-origin";
  const key = `blob:${origin}/${v4.generate()}`;
  blobURLMap.set(key, blob);

  return key;
}

function revokeObjectURL(url: any) {
  let urlObject;

  try {
    urlObject = new URL(url);
  } catch {
    throw new TypeError("Provided URL string is not valid");
  }

  if (urlObject.protocol !== "blob:") {
    return;
  }

  blobURLMap.delete(url);
}

(URL as any).createObjectURL = createObjectURL;
(URL as any).revokeObjectURL = revokeObjectURL;

/**
 * server
 * 
 * @param {LuathOptions} options
 * @param {Number} port
 * @public
 */
export async function server(options?: LuathOptions) {
  const config = resolveOptions(options);
  const rootDir = Deno.cwd();
  const publicDir = join(rootDir, "public");

  const app = opine();

  const fileWatcher = new FileWatcher(rootDir, {});
  const webSocketServer = new WebSocketServer();
  const moduleGraph = new ModuleGraph();

  const esbuildService = await esbuildStartService({
    worker: false,
    wasmURL: "https://esm.sh/esbuild-wasm@0.8.51/esbuild.wasm",
  });

  // LMR
  app.use(lmr(fileWatcher, webSocketServer, moduleGraph));

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
  app.use(error());

  // listen
  const server = app.listen(config.server);
  const closeServer = server.close;

  server.close = () => {
    esbuildService.stop();
    fileWatcher.close();
    webSocketServer.close();
    closeServer();
  };

  const { hostname, port } = server.listener.addr as Deno.NetAddr;
  console.info(`listening on http://${hostname}:${port}`);

  return server;
}

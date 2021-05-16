import type { LuathOptions } from "./types.ts";
import { join, opine, serveStatic } from "../deps.ts";
import { resolveOptions } from "./resolveOptions.ts";

/**
 * run
 *
 * @param {LuathOptions} options
 * @public
 */
export function run(options?: LuathOptions) {
  const config = resolveOptions(options);
  const buildDir = join(config.root, "./dist");
  const app = opine();

  app.use(serveStatic(buildDir));

  return app.listen(config.server);
}

import type {
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from "../../deps.ts";
import type { LuathPlugin } from "../types.ts";
import { exists, join } from "../../deps.ts";
import { ModuleGraph } from "../moduleGraph.ts";
import { lmr } from "../plugins/lmr.ts";
import { isHtml } from "./isHtml.ts";

export function indexHtml(
  rootDir: string,
  moduleGraph: ModuleGraph,
  plugins: LuathPlugin[],
): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction) => {
    const url = req.url === "/" ? "/index.html" : req.url;

    if (isHtml(req)) {
      const filename = join(rootDir, url.slice(1));

      if (await exists(filename)) {
        try {
          let html = await Deno.readTextFile(filename);

          plugins.filter((plugin) =>
            typeof plugin?.transformIndexHtml === "function"
          ).forEach(
            (plugin) => {
              html = plugin.transformIndexHtml!(html);
            },
          );

          html = lmr(moduleGraph, rootDir).transformIndexHtml(html);

          return res.type(".html").end(html);
        } catch (err) {
          return next(err);
        }
      }
    }

    next();
  };
}

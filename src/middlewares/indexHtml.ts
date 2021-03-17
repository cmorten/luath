import type {
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from "../../deps.ts";
import { exists, join } from "../../deps.ts";
import { isHtml } from "./isHtml.ts";
import { ModuleGraph } from "../moduleGraph.ts";
import { lmr } from "./transform/plugins/lmr.ts";

export function indexHtml(
  rootDir: string,
  moduleGraph: ModuleGraph,
  plugins: any[],
): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction) => {
    const url = req.url === "/" ? "/index.html" : req.url;

    if (isHtml(req)) {
      const filename = join(rootDir, url.slice(1));

      if (await exists(filename)) {
        try {
          let html = await Deno.readTextFile(filename);

          plugins.filter((plugin) => !!plugin?.transformIndexHtml).forEach(
            (plugin) => {
              html = plugin.transformIndexHtml(html);
            },
          );

          // TODO: Ideally we don't special case this... though it is a special case!
          html = lmr(moduleGraph, rootDir).transformIndexHtml(html);

          return res.send(html);
        } catch (err) {
          return next(err);
        }
      }
    }

    next();
  };
}

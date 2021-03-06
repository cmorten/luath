import type {
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from "../../deps.ts";
import { exists, join } from "../../deps.ts";
import { isHtml } from "./isHtml.ts";
import { preambleCode } from "./transform/plugins/reactRefresh.ts";

export function indexHtml(rootDir: string): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction) => {
    const url = req.url === "/" ? "/index.html" : req.url;

    if (isHtml(req)) {
      const filename = join(rootDir, url.slice(1));

      if (await exists(filename)) {
        try {
          let html = await Deno.readTextFile(filename);

          // TODO:
          // - lex / parse properly
          // - need a way to say, hey - we're using x plugin which does y to the index.html
          html = html.replace(
            "<head>",
            `<head><script type="module">${preambleCode}</script><script type="module" src="/$__luath.js"></script>`,
            // `<head><script type="module" src="/$__luath.js"></script>`,
          );

          return res.send(html);
        } catch (err) {
          return next(err);
        }
      }
    }

    next();
  };
}

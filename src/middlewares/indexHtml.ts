import type { RequestHandler } from "../../deps.ts";
import { exists, join } from "../../deps.ts";
import { isHtml } from "./isHtml.ts";

export function indexHtml(rootDir: string): RequestHandler {
  return async (req, res, next) => {
    const url = req.url === "/" ? "/index.html" : req.url;

    if (isHtml(req)) {
      const filename = join(rootDir, url.slice(1));

      if (await exists(filename)) {
        try {
          let html = await Deno.readTextFile(filename);

          // TODO: lex/parse properly
          html = html.replace(
            "</head>",
            `<script type="module" src="./_lmr.js"></script></head>`,
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

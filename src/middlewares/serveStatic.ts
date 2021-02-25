import type { RequestHandler } from "../../deps.ts";
import { serveStatic as _serveStatic } from "../../deps.ts";
import { isHtml } from "./isHtml.ts";

export function serveStatic(staticDir: string): RequestHandler {
  const serve = _serveStatic(staticDir);

  return async (req, res, next) => {
    if (isHtml(req)) {
      return next();
    }

    serve(req, res, next);
  };
}

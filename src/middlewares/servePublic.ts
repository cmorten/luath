import type { RequestHandler } from "../../deps.ts";
import { serveStatic } from "../../deps.ts";

export function servePublic(publicDir: string): RequestHandler {
  const serve = serveStatic(publicDir);

  return async (req, res, next) => {
    serve(req, res, next);
  };
}

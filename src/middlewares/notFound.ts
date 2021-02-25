import type { RequestHandler } from "../../deps.ts";

export function notFound(): RequestHandler {
  return async (_req, res, _next) => {
    return res.setStatus(404).end();
  };
}

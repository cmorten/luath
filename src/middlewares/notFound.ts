import type { RequestHandler, Response } from "../../deps.ts";

export function notFound(): RequestHandler {
  return (_req: unknown, res: Response, _next: unknown) => {
    return res.setStatus(404).end();
  };
}

import type { ErrorRequestHandler } from "../../deps.ts";

export function error(): ErrorRequestHandler {
  return async (err, _req, res, _next) => {
    console.error(err);

    return res.setStatus(500).end();
  };
}

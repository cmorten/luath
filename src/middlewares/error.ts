import type { ErrorRequestHandler } from "../../deps.ts";
import { WebSocketServer } from "../webSocketServer.ts";

export function error(webSocketServer: WebSocketServer): ErrorRequestHandler {
  return async (error, _req, res, _next) => {
    webSocketServer.send({
      type: "error",
      error: {
        name: error.name,
        message: error.message,
        code: error.code,
        stack: error.stack,
      },
    });

    return res.setStatus(500).end();
  };
}

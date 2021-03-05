import type { ErrorRequestHandler } from "../../deps.ts";
import { WebSocketServer } from "../webSocketServer.ts";

export function error(webSocketServer: WebSocketServer): ErrorRequestHandler {
  return (error, _req, res, _next) => {
    webSocketServer.send({
      type: "error",
      error: Object.assign({}, error),
    });

    return res.setStatus(500).end();
  };
}

import type {
  ErrorRequestHandler,
  NextFunction,
  Response,
} from "../../deps.ts";
import { WebSocketServer } from "../webSocketServer.ts";

export function error(webSocketServer: WebSocketServer): ErrorRequestHandler {
  return (
    error: unknown,
    _req: unknown,
    res: Response,
    _next: NextFunction,
  ) => {
    const errorJson = Object.getOwnPropertyNames(error).reduce((props, key) => {
      props[key] = (error as Record<string, string>)[key];

      return props;
    }, {} as Record<string, string>);

    webSocketServer.send({
      type: "error",
      error: errorJson,
    });

    return res.setStatus(500).end();
  };
}

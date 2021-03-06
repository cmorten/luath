import type {
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from "../../deps.ts";
import { serveStatic } from "../../deps.ts";

export function servePublic(publicDir: string): RequestHandler {
  const serve = serveStatic(publicDir);

  return (req: Request, res: Response, next: NextFunction) => {
    serve(req, res, next);
  };
}

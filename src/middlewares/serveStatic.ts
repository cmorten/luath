import type {
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from "../../deps.ts";
import { serveStatic as _serveStatic } from "../../deps.ts";
import { isHtml } from "./isHtml.ts";

export function serveStatic(staticDir: string): RequestHandler {
  const serve = _serveStatic(staticDir);

  return (req: Request, res: Response, next: NextFunction) => {
    if (isHtml(req)) {
      return next();
    }

    serve(req, res, next);
  };
}

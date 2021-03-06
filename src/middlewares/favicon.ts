import type {
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from "../../deps.ts";

export const RE_FAVICON_ICO = /(favicon\.ico)($|\?)/;

export const isFavicon = (req: Request) => RE_FAVICON_ICO.test(req.url);

export function favicon(): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    if (isFavicon(req)) {
      return res.setStatus(200).type("image/x-icon").end("");
    }

    next();
  };
}

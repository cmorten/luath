import type { Request, RequestHandler } from "../../deps.ts";

export const RE_FAVICON_ICO = /(favicon\.ico)($|\?)/;

export const isFavicon = (req: Request) => RE_FAVICON_ICO.test(req.url);

export function favicon(): RequestHandler {
  return async (req, res, next) => {
    if (isFavicon(req)) {
      return res.setStatus(200).type("image/x-icon").end("");
    }

    next();
  };
}

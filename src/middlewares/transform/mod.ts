import type {
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from "../../../deps.ts";
import type { LuathPlugin } from "../../types.ts";
import { ModuleGraph } from "../../moduleGraph.ts";
import { isJs } from "../../isJs.ts";
import { isCss } from "../../isCss.ts";
import { isHtml } from "../isHtml.ts";
import { isImport } from "../isImport.ts";
import { bundle } from "./bundle.ts";

export const urlIgnoreList = new Set(["/", "/favicon.ico"]);

const RE_LUATH_JS = /\/\$luath\/.*\.js($|\?|&|#)/;
const isLuathJs = (fileName: string) => RE_LUATH_JS.test(fileName);

export function transform(
  rootDir: string,
  moduleGraph: ModuleGraph,
  plugins: LuathPlugin[],
): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction) => {
    const url = req.url;

    if (
      req.method !== "GET" ||
      isHtml(req) ||
      urlIgnoreList.has(url)
    ) {
      return next();
    }

    const _isCss = isCss(req);

    if (_isCss || isJs(req) || isImport(req)) {
      const mod = await bundle(
        url,
        rootDir,
        moduleGraph,
        plugins,
      );

      if (mod?.code) {
        const type = _isCss ? ".css" : ".js";

        res.type(type).setStatus(200).etag(mod.code);

        if (req.fresh) {
          return res.setStatus(304).end();
        }

        res.set(
          "Cache-Control",
          isLuathJs(url) ? "max-age=31536000,immutable" : "no-cache",
        );

        return res.end(mod.code);
      }
    }
  };
}

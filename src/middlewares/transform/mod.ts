import type { RequestHandler, Service } from "../../../deps.ts";
import { ModuleGraph } from "../../moduleGraph.ts";
import { isHtml } from "../isHtml.ts";
import { isJs } from "../isJs.ts";
import { isCss } from "../isCss.ts";
import { isImport } from "../isImport.ts";
import { bundle } from "./bundle.ts";

export const urlIgnoreList = new Set(["/", "/favicon.ico"]);

export function transform(
  rootDir: string,
  moduleGraph: ModuleGraph,
  esbuildService: Promise<Service>,
): RequestHandler {
  return async (req, res, next) => {
    const url = req.url;

    if (
      req.method !== "GET" ||
      isHtml(req) ||
      urlIgnoreList.has(url)
    ) {
      return next();
    }

    const _isCss = isCss(req);

    try {
      if (_isCss || isJs(req) || isImport(req)) {
        const mod = await bundle(
          url,
          rootDir,
          moduleGraph,
          esbuildService,
        );

        if (mod?.code) {
          const type = _isCss ? ".css" : ".js";

          return res.type(type).send(mod?.code);
        }
      }
    } catch (err) {
      return next(err);
    }

    next();
  };
}

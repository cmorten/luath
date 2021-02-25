import type { Request } from "../../deps.ts";

export const RE_JAVASCRIPT = /\.((j|t)sx?)($|\?)/;

export const isJsExtension = (fileName: string) => RE_JAVASCRIPT.test(fileName);

export const isJs = (req: Request) =>
  isJsExtension(req.url) ||
  req.headers.get("accept")?.includes("application/javascript") ||
  req.headers.get("accept")?.includes("text/javascript");

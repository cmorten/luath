import type { Request } from "../../deps.ts";

export const RE_HTML = /\.(html)($|\?)/;

export const isHtmlExtension = (fileName: string) => RE_HTML.test(fileName);

export const isHtml = (req: Request) =>
  isHtmlExtension(req.url) || req.headers.get("accept")?.includes("text/html");

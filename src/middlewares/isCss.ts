import type { Request } from "../../deps.ts";

export const RE_CSS = /\.css($|\?|&|#)/;

export const isCssExtension = (fileName: string) => RE_CSS.test(fileName);

export const isCssAccept = (req: Request) =>
  req.headers.get("accept")?.includes("text/css");

export const isCss = (req: Request) =>
  isCssExtension(req.url) && isCssAccept(req);

import type { Request } from "../../deps.ts";

export const RE_CSS = /\.(css)($|\?)/;

export const isCssExtension = (fileName: string) => RE_CSS.test(fileName);

export const isCss = (req: Request) =>
  isCssExtension(req.url) || req.headers.get("accept")?.includes("text/css");

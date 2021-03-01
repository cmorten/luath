import type { Request } from "../../deps.ts";

export const RE_CSS = /\.css($|\?)/;
export const RE_CSS_IMPORT = /\.css\.css($|\?)/;

export const isCssExtension = (fileName: string) => RE_CSS.test(fileName);

export const isCssImportExtension = (fileName: string) =>
  RE_CSS_IMPORT.test(fileName);

export const isCssAccept = (req: Request) =>
  req.headers.get("accept")?.includes("text/css");

export const isCss = (req: Request) =>
  isCssExtension(req.url) || isCssAccept(req);

export const isCssImport = (req: Request) =>
  isCssImportExtension(req.url) || isCssAccept(req);

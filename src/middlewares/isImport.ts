import type { Request } from "../../deps.ts";

export const RE_IMPORT = /\?esm($|\?|&|#)/;

export const isImportUrl = (url: string) => RE_IMPORT.test(url);

export const isImport = (req: Request) => isImportUrl(req.url);

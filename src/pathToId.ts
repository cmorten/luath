import { relative, resolve } from "../deps.ts";
import { stripUrl } from "./stripUrl.ts";

export function pathToId(path: string, rootDir: string) {
  return `/${relative(rootDir, resolve(rootDir, stripUrl(path)))}`;
}

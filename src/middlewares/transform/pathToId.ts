import { relative, resolve } from "../../../deps.ts";

export function pathToId(path: string, rootDir: string) {
  return `/${relative(rootDir, resolve(rootDir, path))}`;
}

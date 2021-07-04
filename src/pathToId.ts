import { relative, resolve } from "../deps.ts";

const idCache = new Map();

export function pathToId(path: string, rootDir: string) {
  const key = `${path}-${rootDir}`;

  if (!idCache.has(key)) {
    idCache.set(key, `/${relative(rootDir, resolve(rootDir, path))}`);
  }

  return idCache.get(key);
}

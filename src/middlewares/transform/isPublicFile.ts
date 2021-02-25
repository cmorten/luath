import { existsSync, posix } from "../../../deps.ts";

export function isPublicFile(url: string, rootDir: string): boolean {
  const publicFile = posix.join(rootDir, "public", url.slice(1));

  return existsSync(publicFile);
}

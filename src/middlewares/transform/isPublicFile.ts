import { existsSync, join } from "../../../deps.ts";

export function isPublicFile(id: string, rootDir: string): boolean {
  const publicFile = join(rootDir, "public", id.slice(1));

  return existsSync(publicFile);
}

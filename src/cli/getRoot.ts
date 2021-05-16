import type { LuathOptions } from "../types.ts";

export const getRoot = (root: string, loadedConfig: LuathOptions) =>
  root ?? loadedConfig?.root ?? Deno.cwd();

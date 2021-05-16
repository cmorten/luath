import type { LuathOptions } from "../types.ts";
import { DEFAULT_PORT } from "../constants.ts";

export const getPort = (port: number | undefined, loadedConfig: LuathOptions) =>
  port ?? loadedConfig?.server?.port ?? DEFAULT_PORT;

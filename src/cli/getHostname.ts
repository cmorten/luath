import type { LuathOptions } from "../types.ts";
import { DEFAULT_HOSTNAME } from "../constants.ts";

export const getHostname = (
  hostname: string | undefined,
  loadedConfig: LuathOptions,
) => hostname ?? loadedConfig?.server?.hostname ?? DEFAULT_HOSTNAME;

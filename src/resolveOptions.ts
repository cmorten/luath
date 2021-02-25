import type { LuathOptions } from "./types.ts";
import { defaultLuathOptions } from "./constants.ts";

export function resolveOptions(options?: LuathOptions) {
  return {
    ...defaultLuathOptions,
    ...options,
    server: {
      ...defaultLuathOptions.server,
      ...options?.server,
    },
  };
}

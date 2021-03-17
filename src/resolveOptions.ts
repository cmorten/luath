import type { LuathOptions } from "./types.ts";
import { resolve } from "../deps.ts";
import { defaultLuathOptions } from "./constants.ts";

export function resolveOptions(options?: LuathOptions) {
  if (options?.root) {
    options.root = resolve(options.root);
  }

  return {
    ...defaultLuathOptions,
    ...options,
    server: {
      ...defaultLuathOptions.server,
      ...options?.server,
    },
    plugins: options?.plugins ?? [],
  };
}

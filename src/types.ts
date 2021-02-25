import type { HTTPOptions, HTTPSOptions } from "../deps.ts";

export type LuathServerOptions = HTTPOptions | HTTPSOptions;

export interface LuathOptions {
  server?: LuathServerOptions;
}

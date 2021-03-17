import type { HTTPOptions, HTTPSOptions } from "../deps.ts";

export type LuathServerOptions = HTTPOptions | HTTPSOptions;

export interface LuathOptions {
  root?: string;
  server?: LuathServerOptions;
  plugins?: any[];
}

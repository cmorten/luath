import type { HTTPOptions, HTTPSOptions, Plugin } from "../deps.ts";

export type LuathServerOptions = HTTPOptions | HTTPSOptions;

export interface LuathPlugin extends Plugin {
  transformIndexHtml?: (html: string) => string;
}

export interface LuathOptions {
  root?: string;
  server?: LuathServerOptions;
  plugins?: LuathPlugin[];
}

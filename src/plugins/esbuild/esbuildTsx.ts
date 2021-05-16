import type { Plugin } from "../../../deps.ts";
import { loadUrl, parse } from "../../../deps.ts";
import { isJsExtension } from "../../isJs.ts";
import { transform } from "./transform.ts";

export function esbuildTsx(): Plugin {
  return {
    name: "esbuild-tsx",

    async load(id: string) {
      if (!isJsExtension(id)) {
        return null;
      }

      const url = parse(id);

      if (!url) {
        return null;
      }

      return await loadUrl(url, {});
    },

    async transform(code: string, id: string) {
      if (!isJsExtension(id)) {
        return;
      }

      return await transform("tsx", code, { format: "esm" });
    },
  };
}

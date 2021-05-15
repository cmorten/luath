// deno-lint-ignore-file no-explicit-any
import { esbuild as esbuildInstance, loadUrl, parse } from "../../deps.ts";
import { isJsExtension } from "../isJs.ts";

export function esbuild() {
  return {
    name: "esbuild",

    async load(id: string) {
      if (!isJsExtension(id)) {
        return null;
      }

      const url = parse(id);

      if (!url) {
        return null;
      }

      const code = await loadUrl(url, {});

      return code;
    },

    async transform(code: string, id: string) {
      if (!isJsExtension(id)) {
        return;
      }

      const output = await esbuildInstance.transform(code, {
        format: "esm",
        minify: true,
        loader: "tsx",
      });

      return output.code;
    },
  } as any;
}

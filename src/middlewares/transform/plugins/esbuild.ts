import {
  esbuild as esbuildInstance,
  loadUrl,
  parse,
} from "../../../../deps.ts";
import { isJsExtension } from "../../isJs.ts";

let esbuildInitialized = false;
let esbuildReady = false;

export function esbuild() {
  if (!esbuildInitialized) {
    esbuildInitialized = true;
    
    const esbuildInitializePromise = esbuildInstance.initialize({
      worker: false,
      wasmURL: "https://esm.sh/esbuild-wasm@0.9.3/esbuild.wasm",
    });

    esbuildInitializePromise.then(() => esbuildReady = true);
  }

  return {
    name: "esbuild",

    async load(id: string) {
      if (!esbuildReady || !isJsExtension(id)) {
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
      if (!esbuildReady || !isJsExtension(id)) {
        return;
      }

      const output = await esbuildInstance.transform(code, {
        format: "esm",
        loader: "tsx",
      });

      return output.code;
    },
  };
}

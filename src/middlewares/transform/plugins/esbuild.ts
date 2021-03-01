import type { Service } from "../../../../deps.ts";
import { loadUrl, parse } from "../../../../deps.ts";
import { isJsExtension } from "../../isJs.ts";

export function esbuild(servicePromise: Promise<Service>) {
  let esbuildTransform: Service["transform"];

  servicePromise.then((service) => esbuildTransform = service.transform);

  return {
    name: "esbuild",
    async load(id: string) {
      if (!esbuildTransform || !isJsExtension(id)) {
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
      if (!esbuildTransform || !isJsExtension(id)) {
        return;
      }

      const output = await esbuildTransform(code, {
        format: "esm",
        loader: "tsx",
      });

      return output.code;
    },
  };
}

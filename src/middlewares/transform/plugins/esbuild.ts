import type { Service } from "../../../../deps.ts";
import { isJsExtension } from "../../isJs.ts";

export function esbuild(servicePromise: Promise<Service>) {
  let esbuildTransform: Service["transform"];

  servicePromise.then((service) => esbuildTransform = service.transform);

  return {
    name: "esbuild",
    async transform(code: string, id: string) {
      if (!esbuildTransform || !isJsExtension(id)) {
        return;
      }

      const output = await esbuildTransform(code, {
        format: "esm",
        minify: true,
      });

      return output.code;
    },
  };
}

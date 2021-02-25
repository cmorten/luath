import { isJsExtension } from "../../isJs.ts";

export function esbuild(service: any) {
  return {
    name: "esbuild",
    async transform(code: string, id: string) {
      if (!isJsExtension(id)) {
        return;
      }

      const output = await service.transform(code, {
        format: "esm",
        minify: true,
      });

      return output.code;
    },
  };
}

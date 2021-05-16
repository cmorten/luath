import type { Plugin } from "../../../deps.ts";
import {
  basename,
  esbuild,
  fromFileUrl,
  loadUrl,
  parse,
} from "../../../deps.ts";
import { isCssExtension } from "../../isCss.ts";
import { transform } from "./transform.ts";

export function esbuildCss(cssInputs: string[]): Plugin {
  return {
    name: "esbuild-css",

    async load(id: string) {
      if (!isCssExtension(id)) {
        return null;
      }

      const url = parse(id);

      if (!url) {
        return null;
      }

      if (cssInputs.includes(id)) {
        const output = await esbuild.build({
          entryPoints: [fromFileUrl(url)],
          write: false,
          bundle: true,
          minify: true,
        });

        this.emitFile({
          type: "asset",
          name: basename(id),
          source: output.outputFiles[0].text,
        });

        return "";
      } else {
        const code = await loadUrl(url, {});

        return await transform("css", code);
      }
    },

    generateBundle(_opts, bundle) {
      Object.entries(bundle).forEach(([key, chunkOrAsset]) => {
        if (
          chunkOrAsset.type === "chunk" &&
          cssInputs.includes(chunkOrAsset.facadeModuleId!)
        ) {
          delete bundle[key];
        }
      });

      return;
    },
  };
}

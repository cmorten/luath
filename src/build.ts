// deno-lint-ignore-file no-explicit-any
import type { LuathOptions } from "./types.ts";
import type { Plugin } from "../deps.ts";
import {
  atImport,
  esbuild as esbuildInstance,
  html,
  image,
  json,
  loadUrl,
  parse as parseId,
  postcss,
  resolve,
  rollup,
} from "../deps.ts";
import { resolveOptions } from "./resolveOptions.ts";
import { parse } from "https://esm.sh/fast-html-parser@1.0.1";
import { isJsExtension } from "./isJs.ts";

function esbuild(loader: any) {
  return {
    name: "esbuild",

    async load(id: string) {
      const url = parseId(id);

      if (!url) {
        return null;
      }

      return await loadUrl(url, {});
    },

    async transform(code: string) {
      const output = await esbuildInstance.transform(code, {
        format: "esm",
        minify: true,
        loader,
      });

      return output.code;
    },
  } as any;
}

/**
 * build
 *
 * @param {LuathOptions} LuathOptions
 * @public
 */
export async function build(options?: LuathOptions) {
  const config = resolveOptions(options);

  const index = `${config.root}/index.html`;

  const contents = await Deno.readTextFile(index);
  const dom = parse(contents);
  const inputs = [
    ...dom.querySelectorAll("script"),
    ...dom.querySelectorAll("link"),
  ].map(({ attributes }) =>
    resolve(config.root, attributes.src ?? attributes.href)
  );

  const jsInputs = inputs.filter((src) => isJsExtension(src));

  const esbuildTsxPlugin = esbuild("tsx");

  const bundle = await rollup({
    input: [...jsInputs],
    plugins: [
      ...config.plugins,
      json(),
      image(),
      postcss({
        modules: true,
        plugins: [atImport()],
      }),
      esbuildTsxPlugin,
      html(),
    ] as Plugin[],
  });

  await bundle.write({
    dir: resolve(config.root, "./dist"),
    format: "es" as const,
    entryFileNames: "[name].[hash].js",
    chunkFileNames: "[name].[hash].js",
    assetFileNames: "[name].[hash][extname]",
  });

  // TODO: copy the public dir
}

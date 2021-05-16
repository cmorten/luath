// deno-lint-ignore-file no-explicit-any
import type { LuathOptions } from "./types.ts";
import type { Plugin } from "../deps.ts";
import {
  atImport,
  basename,
  copy,
  DOMParser,
  Element,
  esbuild as esbuildInstance,
  html,
  image,
  join,
  json,
  loadUrl,
  makeHtmlAttributes,
  parse as parseId,
  pluginTerserTransform,
  postcss,
  resolve,
  rollup,
} from "../deps.ts";
import { resolveOptions } from "./resolveOptions.ts";
import { isJsExtension } from "./isJs.ts";
import { isCssExtension } from "./isCss.ts";

async function load(id: string) {
  const url = parseId(id);

  if (!url) {
    return null;
  }

  return await loadUrl(url, {});
}

async function transform(loader: string, code: string, options: any = {}) {
  const output = await esbuildInstance.transform(code, {
    minify: true,
    loader,
    ...options,
  });

  return output.code;
}

function esbuildTsx(): Plugin {
  return {
    name: "esbuild-tsx",
    load,
    async transform(code: string, id: string) {
      if (!isJsExtension(id)) {
        return null;
      }

      return await transform("tsx", code);
    },
  };
}

function esbuildCss(cssInputs: string[]): Plugin {
  return {
    name: "esbuild-css",
    async load(id: string) {
      if (!isCssExtension(id)) {
        return null;
      }

      if (cssInputs.includes(id)) {
        const output = await esbuildInstance.build({
          entryPoints: [id],
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
        const code = await load(id);

        if (!code) {
          return null;
        }

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

/**
 * build
 *
 * @param {LuathOptions} LuathOptions
 * @public
 */
export async function build(options?: LuathOptions) {
  const config = resolveOptions(options);

  const index = join(config.root, "index.html");
  const publicDir = join(config.root, "./public");
  const distDir = join(config.root, "./dist");
  const publicDistDir = join(distDir, "./public");

  const contents = await Deno.readTextFile(index);
  const dom = new DOMParser().parseFromString(contents, "text/html")!;
  const inputs = [
    ...dom.querySelectorAll("script"),
    ...dom.querySelectorAll("link"),
  ].map(({ attributes }: any) => {
    return resolve(config.root, attributes.src ?? attributes.href);
  });

  const metaAttributes = (Array.from(dom.querySelectorAll("meta")) as Element[])
    .map(({ attributes }) => attributes);

  const title = dom.querySelector("title")?.textContent;

  /**
   * Direct CSS imports shouldn't be wrapped in JS
   */
  const cssInputs = inputs.filter((src) => isCssExtension(src));

  const bundle = await rollup({
    input: inputs,
    plugins: [
      ...config.plugins,
      json(),
      image(),
      esbuildCss(cssInputs),
      esbuildTsx(),
      postcss({
        modules: true,
        plugins: [atImport()],
        exclude: cssInputs,
      }),
      pluginTerserTransform() as any,
      html({
        meta: metaAttributes,
        template: ({ attributes, files, meta, publicPath }) => {
          // TODO: use deno-dom to manipulate the DOM rather than
          // manually construct strings + templates and then return
          // with the dom.outerHTML like setup. Currently fragile
          // to the existence of elements in HEAD which have not
          // been considered.
          const htmlAttributes = {
            ...attributes.html,
            ...dom.querySelector("html")?.attributes,
          };

          const scripts = (files.js ?? [])
            .map(({ fileName }) => {
              const attrs = makeHtmlAttributes(attributes.script);

              return `<script src="${publicPath}${fileName}"${attrs}></script>`;
            })
            .join("\n\t\t");

          const cssLinks = (files.css ?? [])
            .map(({ fileName }) => {
              const attrs = makeHtmlAttributes(attributes.link);

              return `<link href="${publicPath}${fileName}" rel="stylesheet"${attrs}>`;
            })
            .join("\n\t\t");

          const nonCssLinks =
            (Array.from(dom.querySelectorAll("link")) as Element[])
              .filter((link) => !isCssExtension(link.attributes?.href))
              .map((link: any) => {
                const { href, ...nonHrefAttr } = link.attributes;
                let attrs = makeHtmlAttributes({
                  ...attributes.link,
                  ...nonHrefAttr,
                });
                if (href) {
                  attrs = ` href="${publicPath}${href}"${attrs}`;
                }

                return `<link${attrs}>`;
              })
              .join("\n\t\t");

          const metas = meta
            .map((input) => {
              const attrs = makeHtmlAttributes(input);
              return `<meta${attrs}>`;
            })
            .join("\n\t\t");

          const body = dom.querySelector("body");
          body?.querySelectorAll("script,link,meta").forEach((node) => {
            node.remove();
          });
          const bodyContent = body?.innerHTML.trim();

          return `<!DOCTYPE HTML>
<html${makeHtmlAttributes(htmlAttributes)}>
  <head>
    ${metas}${title ? `\n\t\t<title>${title}</title>` : ""}
    ${nonCssLinks}
    ${cssLinks}
  </head>
  <body>${bodyContent ? `\n\t\t${bodyContent}` : ""}
    ${scripts}
  </body>
</html>`;
        },
      }),
    ],
    onwarn() {
      // TODO: We should expose these ( perhaps optionally )
    },
  });

  await bundle.write({
    dir: distDir,
    format: "es" as const,
    entryFileNames: "[name].[hash].js",
    chunkFileNames: "[name].[hash].js",
    assetFileNames: "[name].[hash][extname]",
  });

  await bundle.close();
  esbuildInstance.stop();

  await copy(publicDir, publicDistDir, { overwrite: true });
}

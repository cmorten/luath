import type { Plugin } from "../deps.ts";
import type { LuathOptions } from "./types.ts";
import {
  atImport,
  copy,
  DOMParser,
  Element,
  esbuild,
  html,
  image,
  join,
  json,
  makeHtmlAttributes,
  pluginTerserTransform,
  postcss,
  resolve,
  rollup,
} from "../deps.ts";
import { resolveOptions } from "./resolveOptions.ts";
import { isCssExtension } from "./isCss.ts";
import { esbuildCss, esbuildTsx } from "./plugins/esbuild/mod.ts";

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
  const inputs = ([
    ...dom.querySelectorAll("script"),
    ...dom.querySelectorAll("link"),
  ] as Element[]).map(({ attributes }) => {
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
      // TODO: need concept of pre / post for custom plugins
      ...config.plugins,
      json(),
      image(),
      esbuildCss(cssInputs),
      esbuildTsx(),
      // TODO: this should be configurable - not everyone uses css modules.
      postcss({
        modules: true,
        plugins: [atImport()],
        exclude: cssInputs,
      }),
      pluginTerserTransform() as Plugin,
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
              .map((link) => {
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
  esbuild.stop();

  await copy(publicDir, publicDistDir, { overwrite: true });
}

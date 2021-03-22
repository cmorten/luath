import type { ImportSpecifier } from "../../deps.ts";
import { esModuleLexerInit, MagicString, parseImports } from "../../deps.ts";
import { ModuleGraph } from "../moduleGraph.ts";
import { pathToId } from "../pathToId.ts";
import { isCssExtension } from "../isCss.ts";
import { stripUrl } from "../stripUrl.ts";
import { isHttpUrl } from "../isHttpUrl.ts";
import { isMetaImport } from "../isMetaImport.ts";
import { isLuathImport } from "../isLuathImport.ts";
import { isHot } from "./isHot.ts";

export const LMR_JS_PATH_IMPORT = "/$luath/client.js";

export function lmr(moduleGraph: ModuleGraph, rootDir: string) {
  return {
    name: "luath-plugin-hot-module-reloading",

    async transform(code: string, id: string) {
      if (isCssExtension(id) || isLuathImport(id)) {
        return code;
      }

      await esModuleLexerInit;
      let imports: readonly ImportSpecifier[] = [];

      try {
        imports = parseImports(code)[0];
      } catch (_) {
        // swallow
      }

      let s: MagicString | undefined;
      const str = () => s || (s = new MagicString(code));

      const hasHotMeta = isHot(code);

      for (let index = 0; index < imports.length; index++) {
        const {
          s: start,
          e: end,
        } = imports[index];

        const rawUrl = stripUrl(code.slice(start, end)).replace(
          ".css",
          ".css.js",
        );

        if (
          !isMetaImport(rawUrl) && !isHttpUrl(rawUrl) && !isLuathImport(rawUrl)
        ) {
          const mod = moduleGraph.get(pathToId(rawUrl, rootDir));

          if (mod?.mtime) {
            str().overwrite(start, end, `${rawUrl}?im&mtime=${mod.mtime}`);
          } else {
            str().overwrite(start, end, `${rawUrl}?im`);
          }
        }
      }

      if (hasHotMeta) {
        str().prepend(
          `import { luath as $luath } from "${LMR_JS_PATH_IMPORT}";\n` +
            `import.meta.hot = $luath(import.meta.url);\n`,
        );
      } else {
        str().append(
          `\nimport { luath as $luath } from "${LMR_JS_PATH_IMPORT}";\n` +
            `import.meta.hot = $luath(import.meta.url);`,
        );
      }

      return str().toString();
    },

    transformIndexHtml(html: string) {
      return html = html.replace(
        "</body>",
        `<script type="module" src="/$luath/client.js"></script></body>`,
      );
    },
  };
}

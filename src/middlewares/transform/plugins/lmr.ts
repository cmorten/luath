import {
  ImportSpecifier,
  init,
  parse as parseImports,
} from "https://esm.sh/es-module-lexer";
import { default as MagicString } from "https://esm.sh/magic-string";
import { isHot } from "./isHot.ts";
import { pathToId } from "../../pathToId.ts";
import { isCssExtension } from "../../isCss.ts";
import { getLmrClient } from "../../getLmrClient.ts";
import { stripUrl } from "../../stripUrl.ts";
import { ModuleGraph } from "../../../moduleGraph.ts";

export const LMR_JS_PATH_IMPORT = "$__luath.js";
export const LMR_JS_URL_IMPORT =
  new URL(LMR_JS_PATH_IMPORT, "http://localhost:3000").href;

export function lmr(moduleGraph: ModuleGraph, rootDir: string) {
  return {
    name: "luath",
    resolveId(id: string) {
      if (id.endsWith(LMR_JS_PATH_IMPORT)) {
        return id;
      }
    },
    load(id: string) {
      if (id.endsWith(LMR_JS_PATH_IMPORT)) {
        return getLmrClient();
      }

      return null;
    },
    async transform(code: string, id: string) {
      if (isCssExtension(id) || /\$__luath/.test(id)) {
        return code;
      }

      await init;
      let imports: ImportSpecifier[] = [];

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

        const mod = moduleGraph.get(pathToId(rawUrl, rootDir));

        if (mod?.mtime) {
          str().overwrite(start, end, `${rawUrl}?mtime=${mod.mtime}`);
        } else {
          str().overwrite(start, end, rawUrl);
        }
      }

      if (hasHotMeta) {
        str().prepend(
          `import { luath as $__luath } from "${LMR_JS_URL_IMPORT}";\n` +
            `import.meta.hot = $__luath(import.meta.url);\n`,
        );
      } else {
        str().append(
          `\nimport { luath as $__luath } from "${LMR_JS_URL_IMPORT}";\n` +
            `import.meta.hot = $__luath(import.meta.url); import.meta.hot.accept();`,
        );
      }

      return str().toString();
    },
  };
}

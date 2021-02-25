import { isJsExtension } from "../../isJs.ts";
import { getLmrClient } from "../../getLmrClient.ts";

export const RE_HOT = /import\.meta\.hot/;

export const isHot = (code: string) => RE_HOT.test(code);

export const LMR_JS_PATH_IMPORT = "./_lmr.js";

export function lmr() {
  return {
    name: "luath-module-reloading-plugin",
    resolveId(id: string) {
      if (id === LMR_JS_PATH_IMPORT) {
        return LMR_JS_PATH_IMPORT;
      }
    },
    load(id: string) {
      if (id === LMR_JS_PATH_IMPORT) {
        return getLmrClient();
      }

      return null;
    },
    transform(code: string, id: string) {
      if (!isJsExtension(id)) {
        return;
      }

      const hasHotMeta = isHot(code);

      if (hasHotMeta) {
        code =
          `import { luath as $__luath } from "${LMR_JS_PATH_IMPORT}"; import.meta.hot = $__luath(import.meta.url);\n` +
          code;
      } else {
        code +=
          `\nimport { luath as $__luath } from "${LMR_JS_PATH_IMPORT}"; $__luath(import.meta.url);`;
      }

      return code;
    },
  };
}

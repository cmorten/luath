// deno-lint-ignore-file no-explicit-any
import {
  pluginTransformReactJsxSelf,
  pluginTransformReactJsxSource,
  reactRefreshBabel,
  transformSync,
} from "../../deps.ts";

const REACT_REFRESH_PATH_IMPORT = "/$luath/react-refresh.js";

export const REACT_REFRESH_BOOTSTRAP =
  `import RefreshRuntime from "${REACT_REFRESH_PATH_IMPORT}";
RefreshRuntime.injectIntoGlobalHook(window);
window.$RefreshReg$ = () => {};
window.$RefreshSig$ = () => (type) => type;
window.$luath_react_refresh_bootstrap = true;`;

const REACT_REFRESH_REMOTE_URL =
  "https://unpkg.com/react-refresh@0.10.0/cjs/react-refresh-runtime.development.js";

const REACT_REFRESH_RUNTIME_CODE_PROMISE = fetch(REACT_REFRESH_REMOTE_URL)
  .then((res) => res.text())
  .then((code) => code.replace("process.env.NODE_ENV", "'development'"))
  .then((code) => {
    return `const exports = {};
${code}
function debounce(callback, delay) {
  let handle;

  return () => {
    clearTimeout(handle);
    handle = setTimeout(callback, delay);
  }
}
const performReactRefresh = exports.performReactRefresh;
exports.performReactRefresh = debounce(performReactRefresh, 16);
export default exports;`;
  });

function shouldIgnore(code: string, id: string) {
  if (id.endsWith(REACT_REFRESH_PATH_IMPORT)) {
    return true;
  } else if (!/\.(t|j)sx?$/.test(id)) {
    return true;
  } else if (!id.endsWith("x") && !code.includes("react")) {
    return true;
  }

  return false;
}

/**
 * Transform plugin for transforming and injecting per-file refresh code.
 */
export function reactRefresh() {
  return {
    name: "luath-plugin-react-refresh",

    resolveId(id: string) {
      if (id.endsWith(REACT_REFRESH_PATH_IMPORT)) {
        return REACT_REFRESH_PATH_IMPORT;
      }
    },

    load(id: string) {
      if (id === REACT_REFRESH_PATH_IMPORT) {
        return REACT_REFRESH_RUNTIME_CODE_PROMISE;
      }
    },

    transform(code: string, id: string) {
      if (shouldIgnore(code, id)) {
        return code;
      }

      const parserPlugins = [
        "jsx",
        "importMeta",
        "topLevelAwait",
        "classProperties",
        "classPrivateProperties",
        "classPrivateMethods",
      ];

      if (/\.tsx?$/.test(id)) {
        parserPlugins.push("typescript", "decorators-legacy");
      }

      const result = transformSync(code, {
        configFile: false,
        filename: id,
        parserOpts: {
          sourceType: "module",
          allowAwaitOutsideFunction: true,
          plugins: parserPlugins,
        },
        plugins: [
          pluginTransformReactJsxSelf,
          pluginTransformReactJsxSource,
          [reactRefreshBabel, { skipEnvCheck: true }],
        ],
        ast: true,
        sourceMaps: true,
        sourceFileName: id,
      });

      if (!/\$RefreshReg\$\(/.test(result.code)) {
        return code;
      }

      const intro = `import RefreshRuntime from "${REACT_REFRESH_PATH_IMPORT}";

let prevRefreshReg;
let prevRefreshSig;

if (!window.$luath_react_refresh_bootstrap) {
  throw new Error("failed to install React refresh");
}

if (import.meta.hot) {
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    RefreshRuntime.register(type, ${JSON.stringify(id)} + " " + id)
  };
  window.$RefreshSig$ = RefreshRuntime.createSignatureFunctionForTransform;
}\n`;

      const outro = `if (import.meta.hot) {
  window.$RefreshReg$ = prevRefreshReg;
  window.$RefreshSig$ = prevRefreshSig;

  ${isRefreshBoundary(result.ast) ? `import.meta.hot.accept();` : ``}

  if (!window.$luath_react_refresh_timeout) {
    window.$luath_react_refresh_timeout = setTimeout(() => {
      window.$luath_react_refresh_timeout = 0;
      RefreshRuntime.performReactRefresh();
    }, 30);
  }
}`;

      return `${intro}${result.code}${outro}`;
    },

    transformIndexHtml(html: string) {
      return html.replace(
        "<head>",
        `<head><script type="module">${REACT_REFRESH_BOOTSTRAP}</script>`,
      );
    },
  };
}

function isComponentishName(name: unknown) {
  return typeof name === "string" && name[0] >= "A" && name[0] <= "Z";
}

function isRefreshBoundary(ast: any) {
  return ast.program.body.every((node: any) => {
    if (node.type !== "ExportNamedDeclaration") {
      return true;
    }

    const { declaration, specifiers } = node;

    if (declaration && declaration.type === "VariableDeclaration") {
      return declaration.declarations.every(
        ({ id }: any) =>
          id.type === "Identifier" && isComponentishName(id.name),
      );
    }

    return specifiers.every(
      ({ exported }: any) =>
        exported.type === "Identifier" && isComponentishName(exported.name),
    );
  });
}

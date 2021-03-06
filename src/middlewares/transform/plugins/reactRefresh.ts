// deno-lint-ignore-file no-explicit-any
import {
  pluginTransformReactJsxSelf,
  pluginTransformReactJsxSource,
  reactRefreshBabel,
  transformSync,
} from "../../../../deps.ts";

export const runtimePublicPath = "/$__luath_react_refresh.js";
export const runtimeUrl =
  new URL(runtimePublicPath, "http://localhost:3000").href;

const runtime = (await (await fetch(
  "https://unpkg.com/react-refresh@0.9.0/cjs/react-refresh-runtime.development.js",
))
  .text()).replace("process.env.NODE_ENV", "'development'");

const runtimeCode = `
const exports = {};
${runtime}
function debounce(fn, delay) {
  let handle;

  return () => {
    clearTimeout(handle);
    handle = setTimeout(fn, delay);
  }
}
const performReactRefresh = exports.performReactRefresh;
exports.performReactRefresh = debounce(performReactRefresh, 16);
export default exports;
`;

export const preambleCode = `
import RefreshRuntime from "${runtimeUrl}";
RefreshRuntime.injectIntoGlobalHook(window);
window.$RefreshReg$ = () => {};
window.$RefreshSig$ = () => (type) => type;
window.$__luath_react_refresh_preamble_installed = true;
`;

/**
 * Transform plugin for transforming and injecting per-file refresh code.
 */
export function reactRefresh() {
  return {
    name: "react-refresh",

    resolveId(id: string) {
      if (id.endsWith(runtimePublicPath)) {
        return id;
      }
    },

    load(id: string) {
      if (id.endsWith(runtimePublicPath)) {
        return runtimeCode;
      }
    },

    transform(code: string, id: string) {
      if (id.endsWith(runtimePublicPath)) {
        return code;
      }

      if (!/\.(t|j)sx?$/.test(id)) {
        return code;
      }

      if (!id.endsWith("x") && !code.includes("react")) {
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
        // no component detected in the file
        return code;
      }

      const header = `
  import RefreshRuntime from "${runtimeUrl}";

  let prevRefreshReg;
  let prevRefreshSig;

  if (!window.$__luath_react_refresh_preamble_installed) {
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

      const footer = `
  if (import.meta.hot) {
    window.$RefreshReg$ = prevRefreshReg;
    window.$RefreshSig$ = prevRefreshSig;

    ${isRefreshBoundary(result.ast) ? `import.meta.hot.accept();` : ``}
    if (!window.$__luath_react_refresh_timeout) {
      window.$__luath_react_refresh_timeout = setTimeout(() => {
        window.$__luath_react_refresh_timeout = 0;
        RefreshRuntime.performReactRefresh();
      }, 30);
    }
  }`;

      return `${header}${result.code}${footer}`;
    },
  };
}

function isRefreshBoundary(ast: any) {
  // Every export must be a React component.
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

/**
 * @param {string} name
 */
function isComponentishName(name: unknown) {
  return typeof name === "string" && name[0] >= "A" && name[0] <= "Z";
}

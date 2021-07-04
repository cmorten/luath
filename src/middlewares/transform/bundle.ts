import type { LuathPlugin } from "../../types.ts";
import type { OutputChunk, Plugin } from "../../../deps.ts";
import {
  atImport,
  dirname,
  image,
  join,
  json,
  postcss,
  relative,
  resolve,
  rollup,
} from "../../../deps.ts";
import { ModuleGraph } from "../../moduleGraph.ts";
import { pathToId } from "../../pathToId.ts";
import { isCssExtension } from "../../isCss.ts";
import { stripUrl } from "../../stripUrl.ts";
import { isLuathImport } from "../../isLuathImport.ts";
import { isHttpUrl } from "../../isHttpUrl.ts";
import { lmr, LMR_JS_PATH_IMPORT } from "../../plugins/lmr.ts";
import { esbuildTsx } from "../../plugins/esbuild/mod.ts";
import { isImportUrl } from "../isImport.ts";
import { isPublicFile } from "./isPublicFile.ts";
import { isBareImportSpecifier } from "../../isBareImportSpecifier.ts";
import { getEntryChunk } from "./getEntryChunk.ts";
import { getCssAsset } from "./getCssAsset.ts";

function injectCss(
  code: string,
  styleName: string,
  styleCode: string,
) {
  return `import { style as $luath_style } from "${LMR_JS_PATH_IMPORT}";\n` +
    `$luath_style(${JSON.stringify(styleName)}, \`${
      styleCode.replace("\n", "")
    }\`);\n` + code +
    `if (import.meta.hot) { import.meta.hot.accept(); }`;
}

const pathCache = new Map();

function idToPath(id: string, rootDir: string) {
  const key = `${id}-${rootDir}`;

  if (!pathCache.has(key)) {
    pathCache.set(key, join(rootDir, id.slice(1).replace(".css.js", ".css")));
  }

  return pathCache.get(key);
}

function getImports(entryChunk: OutputChunk) {
  const seen: Record<string, string> = {};
  const imports: string[] = [];

  entryChunk.imports.forEach((path) => {
    if (!isLuathImport(path) && !isHttpUrl(path) && !seen[path]) {
      imports.push(path);
    }
  });
  entryChunk.dynamicImports.forEach((path) => {
    if (!isLuathImport(path) && !isHttpUrl(path) && !seen[path]) {
      imports.push(path);
    }
  });

  return imports;
}

const jsonPlugin = json();
const imagePlugin = image();
const esbuildPlugin = esbuildTsx();

let buildCache: any;

export async function bundle(
  url: string,
  rootDir: string,
  moduleGraph: ModuleGraph,
  plugins: LuathPlugin[],
) {
  const id = stripUrl(url);
  const cachedMod = moduleGraph.get(id);

  if (!cachedMod?.stale && !!cachedMod?.code) {
    return cachedMod;
  }

  const filename = idToPath(id, rootDir);

  let code = null;

  try {
    code = await Deno.readTextFile(filename);
  } catch (err) {
    if (!(err instanceof Deno.errors.NotFound)) {
      throw err;
    }
  }

  if (code == null) {
    if (isPublicFile(id, rootDir)) {
      throw new Error(
        `Failed to load url ${id} as it was in the "public/" directory.`,
      );
    } else if (!isLuathImport(id)) {
      return null;
    }
  }

  const cssImports: Set<string> = new Set();

  const build = await rollup({
    input: filename,
    cache: buildCache,
    plugins: [
      // TODO: need concept of pre / post for custom plugins
      ...plugins,
      jsonPlugin,
      imagePlugin,
      // TODO: this should be configurable - not everyone uses css modules.
      postcss({
        modules: true,
        plugins: [atImport({
          resolve(path: string) {
            cssImports.add(path);

            return path;
          },
        })],
      }),
      esbuildPlugin,
      lmr(moduleGraph, rootDir),
    ] as Plugin[],
    external: (source) => !isBareImportSpecifier(source),
    onwarn() {},
    treeshake: false,
    makeAbsoluteExternalsRelative: false,
  });

  buildCache = build.cache;

  const { output } = await build.generate({
    sourcemap: false,
    format: "es" as const,
    preserveModules: true,
    indent: false,
    hoistTransitiveImports: false,
    paths(id: string) {
      if (id.startsWith(rootDir)) {
        return `/${relative(rootDir, id)}`;
      }

      return id;
    },
  });

  const entryChunk = getEntryChunk(output);
  const isCss = isCssExtension(id);
  const entryId = isCss ? `${id}.js` : id;
  const entryMod = moduleGraph.ensure(entryId);

  entryMod.stale = false;
  entryMod.code = entryChunk.code;

  const idDirname = dirname(id);
  const dotIdDirname = `.${idDirname}`;

  getImports(entryChunk)
    .forEach((path) => {
      const importedId = pathToId(resolve(dotIdDirname, path), rootDir);
      const importedMod = moduleGraph.ensure(importedId);

      importedMod.dependents.add(entryId);
      entryMod.dependencies.add(importedId);
    });

  const cssAsset = getCssAsset(output);

  if (cssAsset) {
    const baseId = pathToId(idDirname, rootDir);
    const assetId = resolve(
      baseId,
      cssAsset.fileName.replace(".css.css", ".css"),
    );

    const assetMod = moduleGraph.ensure(assetId);

    assetMod.stale = false;
    assetMod.code = cssAsset.source as string;
    assetMod.dependents.add(entryId);

    if (!isImportUrl(url)) {
      assetMod.acceptingUpdates = true;
    }

    Array.from(cssImports)
      .filter((path) => !isLuathImport(path) && !isHttpUrl(path))
      .forEach((path) => {
        const importedId = resolve(baseId, path);
        const importedMod = moduleGraph.ensure(importedId);

        importedMod.stale = false;
        importedMod.dependents.add(assetId);
        assetMod.dependencies.add(importedId);
      });

    entryMod.dependencies.add(assetId);
    entryMod.code = injectCss(
      entryMod.code!,
      assetId,
      assetMod.code!,
    );

    if (isCss) {
      return moduleGraph.get(assetId);
    }
  }

  return entryMod;
}

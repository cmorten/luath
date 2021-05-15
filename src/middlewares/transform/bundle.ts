import type { LuathPlugin } from "../../types.ts";
import type { Plugin } from "../../../deps.ts";
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
import { esbuild } from "../../plugins/esbuild.ts";
import { isImportUrl } from "../isImport.ts";
import { isPublicFile } from "./isPublicFile.ts";
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

function idToPath(id: string, rootDir: string) {
  return join(rootDir, id.slice(1).replace(".css.js", ".css"));
}

export async function bundle(
  url: string,
  rootDir: string,
  moduleGraph: ModuleGraph,
  plugins: LuathPlugin[],
) {
  const id = stripUrl(url);
  const cachedMod = moduleGraph.get(id);
  const useCache = !cachedMod?.stale && cachedMod?.code;

  if (useCache) {
    return cachedMod;
  }

  const filename = idToPath(id, rootDir);

  let code = null;

  try {
    code = Deno.readTextFileSync(filename);
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
    cache: false,
    plugins: [
      // TODO: need concept of pre / post for custom plugins
      ...plugins,
      json(),
      image(),
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
      esbuild(),
      lmr(moduleGraph, rootDir),
    ] as Plugin[],
    external: () => true,
    onwarn() {},
    treeshake: false,
  });

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
  const entryId = isCss
    ? resolve(pathToId(dirname(id), rootDir), entryChunk.fileName)
    : id;
  const entryMod = moduleGraph.ensure(entryId);

  entryMod.stale = false;
  entryMod.code = entryChunk.code;

  Array.from(
    new Set([
      ...entryChunk.imports,
      ...entryChunk.dynamicImports,
    ]),
  )
    .filter((path) => !isLuathImport(path) && !isHttpUrl(path))
    .forEach((path) => {
      const importedId = pathToId(path, rootDir);
      const importedMod = moduleGraph.ensure(importedId);

      importedMod.dependents.add(entryId);
      entryMod.dependencies.add(importedId);
    });

  const cssAsset = getCssAsset(output);

  if (cssAsset) {
    const assetId = resolve(
      pathToId(dirname(id), rootDir),
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
        const importedId = resolve(pathToId(dirname(id), rootDir), path);
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

import type { LuathPlugin } from "../../types.ts";
import type { Plugin } from "../../../deps.ts";
import {
  atImport,
  image,
  join,
  json,
  postcss,
  relative,
  rollup,
} from "../../../deps.ts";
import { ModuleGraph } from "../../moduleGraph.ts";
import { pathToId } from "../pathToId.ts";
import { isCssExtension } from "../isCss.ts";
import { isImportUrl } from "../isImport.ts";
import { stripUrl } from "../stripUrl.ts";
import { lmr, LMR_JS_PATH_IMPORT } from "./plugins/lmr.ts";
import { esbuild } from "./plugins/esbuild.ts";
import { isLuathImport } from "./isLuathImport.ts";
import { isPublicFile } from "./isPublicFile.ts";
import { getEntryChunk } from "./getEntryChunk.ts";
import { getCssAsset } from "./getCssAsset.ts";
import { isHttpUrl } from "./isHttpUrl.ts";

function injectCss(
  code: string,
  styleName: string,
) {
  return `import { style as $luath_style } from "${LMR_JS_PATH_IMPORT}";\n` +
    `$luath_style(${JSON.stringify(styleName)});\n` + code;
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
  const isCss = isCssExtension(id);
  const isImport = isImportUrl(url);

  const cachedMod = moduleGraph.get(id);
  const useCache = cachedMod?.code && !cachedMod?.stale;

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

  // TODO: This needs checking
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
    hoistTransitiveImports: false,
    paths(id: string) {
      if (id.startsWith(rootDir)) {
        return `/${relative(rootDir, id)}`;
      }

      return id;
    },
  });

  const entryChunk = getEntryChunk(output);
  const entryId = isCss ? pathToId(entryChunk.fileName, rootDir) : id;
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
    const assetId = pathToId(
      cssAsset.fileName.replace(".css.css", ".css"),
      rootDir,
    );
    const assetMod = moduleGraph.ensure(assetId);

    assetMod.stale = false;
    assetMod.code = cssAsset.source as string;
    assetMod.dependents.add(entryId);

    if (!isImport) {
      assetMod.acceptingUpdates = true;
    }

    Array.from(cssImports)
      .filter((path) => !isLuathImport(path) && !isHttpUrl(path))
      .forEach((path) => {
        const importedId = pathToId(path, rootDir);
        const importedMod = moduleGraph.ensure(importedId);

        importedMod.stale = false;
        importedMod.dependents.add(assetId);
        assetMod.dependencies.add(importedId);
      });

    entryMod.dependencies.add(assetId);
    entryMod.code = injectCss(
      entryMod.code!,
      assetId,
    );

    if (isCss) {
      return moduleGraph.get(assetId);
    }
  }

  return entryMod;
}

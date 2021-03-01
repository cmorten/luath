import type { Service } from "../../../deps.ts";
import { atImport, image, join, json, postcss, rollup } from "../../../deps.ts";
import { ModuleGraph } from "../../moduleGraph.ts";
import { stripUrl } from "../stripUrl.ts";
import { isPublicFile } from "./isPublicFile.ts";
import { getEntryChunk } from "./getEntryChunk.ts";
import { getCssAsset } from "./getCssAsset.ts";
import { isHttpUrl } from "./isHttpUrl.ts";
import { pathToId } from "./pathToId.ts";
import { lmr, LMR_JS_URL_IMPORT } from "./plugins/lmr.ts";
import { esbuild } from "./plugins/esbuild.ts";
import { reactRefresh } from "./plugins/reactRefresh.ts";

function injectCss(
  code: string,
  styleName: string,
) {
  return `import { style as $__luath_style } from "${LMR_JS_URL_IMPORT}";\n` +
    `$__luath_style(${JSON.stringify(styleName)});\n` + code;
}

// TODO: List:
// - caching
// - ensuring @import works in .css
// - this nonsense with .css.css everywhere
// - inject plugins ( reactRefresh ) rather than hardcoded in here

export async function bundle(
  url: string,
  rootDir: string,
  moduleGraph: ModuleGraph,
  esbuildService: Promise<Service>,
) {
  url = stripUrl(url);
  const isDirectCss = /\.css\.css/.test(url);
  const id = url.replace(".css.css", ".css");

  // TODO: fix caching
  // const cachedMod = moduleGraph.get(url);
  // const useCache = cachedMod?.code && !cachedMod?.stale;
  //
  //
  // if (useCache) {
  //   return cachedMod;
  // }

  const filename = join(rootDir, id.slice(1));
  let code = null;

  // If we don't have it cached, let's try the local fs.
  try {
    code = Deno.readTextFileSync(filename);
  } catch (err) {
    if (!(err instanceof Deno.errors.NotFound)) {
      throw err;
    }
  }

  // TODO: This needs checking!
  // If we couldn't find it, maybe it's:
  // - In the public directory
  // - Is a "special" luath thingy
  if (code == null) {
    if (isPublicFile(id, rootDir)) {
      throw new Error(
        `Failed to load url ${id} as it was in the "public/" directory.`,
      );
    } else if (!/\$__luath/.test(id)) {
      return null;
    }
  }

  const cssImports: Set<string> = new Set();

  const build = await rollup({
    input: filename,
    plugins: [
      reactRefresh(),
      json(),
      image(),
      postcss({
        modules: true,
        plugins: [atImport({
          resolve(path: string) {
            cssImports.add(pathToId(path, rootDir));

            return path;
          },
        })],
      }),
      esbuild(esbuildService),
      lmr(moduleGraph, rootDir),
    ],
    external: () => true,
    onwarn() {},
    treeshake: false,
  });

  const { output } = await build.generate({
    sourcemap: false,
    format: "es" as const,
    preserveModules: true,
    hoistTransitiveImports: false,
  });

  const entryMod = moduleGraph.ensure(id);
  const entryChunk = getEntryChunk(output);

  // If it's not an asset then it's a chunk.
  // Either JS or a CSS proxy module
  // Because we preserve module structure, a
  // bundle will be at most 2 files: the entry,
  // a CSS asset.
  entryMod.stale = false;
  entryMod.code = entryChunk.code;

  // Ensure that we populate the module graph properly
  // Ignoring the LMR injected imports, and any external
  // URL imports.
  Array.from(
    new Set([
      ...entryChunk.imports,
      ...entryChunk.dynamicImports,
    ]),
  )
    .filter((path) => path !== LMR_JS_URL_IMPORT && !isHttpUrl(path))
    .forEach((path) => {
      const importedId = pathToId(path, rootDir);
      const importedMod = moduleGraph.ensure(importedId);

      importedMod.stale = false;
      importedMod.dependents.add(id);

      entryMod.dependencies.add(importedId);
    });

  const cssAsset = getCssAsset(output);

  if (cssAsset) {
    const assetId = pathToId(cssAsset.fileName, rootDir);
    const assetMod = moduleGraph.ensure(assetId);

    assetMod.stale = false;
    assetMod.code = cssAsset.source as string;
    assetMod.dependents.add(id);

    entryMod.dependencies.add(assetId);
    entryMod.code = injectCss(
      entryMod.code!,
      assetId,
    );
  }

  if (isDirectCss) {
    return moduleGraph.get(url);
  }

  return entryMod;
}

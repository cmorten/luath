import type { Service } from "../../../deps.ts";
import {
  atImport,
  image,
  json,
  posix,
  postcss,
  relative,
  resolve,
  rollup,
} from "../../../deps.ts";
import { ModuleGraph } from "../../moduleGraph.ts";
import { isCssExtension } from "../isCss.ts";
import { isJsExtension } from "../isJs.ts";
import { stripUrl } from "../stripUrl.ts";
import { isPublicFile } from "./isPublicFile.ts";
import { getEntryChunk } from "./getEntryChunk.ts";
import { getCssAsset } from "./getCssAsset.ts";
import { lmr, LMR_JS_PATH_IMPORT } from "./plugins/lmr.ts";
import { esbuild } from "./plugins/esbuild.ts";

function injectCss(
  code: string,
  styleName: string,
) {
  return `import { style as $__luath_style } from "${LMR_JS_PATH_IMPORT}";\n` +
    `$__luath_style(${JSON.stringify(styleName)});\n` + code;
}

const minifyCss = (code: string) => code.replace(/\s+/g, "");

function addRealModulesToGraph(
  moduleGraph: ModuleGraph,
  realModules: string[],
  parentId: string,
) {
  const parentMod = moduleGraph.ensure(parentId);

  realModules.forEach((id) => {
    const realMod = moduleGraph.ensure(id);
    realMod.stale = false;
    realMod.dependents.add(parentId);
    parentMod.dependencies.add(id);
  });
}

function pathToId(path: string, rootDir: string) {
  return `/${relative(rootDir, resolve(rootDir, path))}`;
}

export async function bundle(
  url: string,
  rootDir: string,
  moduleGraph: ModuleGraph,
  esbuildService: Promise<Service>,
) {
  const id = stripUrl(url);
  const cachedMod = moduleGraph.get(id);

  if (cachedMod?.code && !cachedMod?.stale) {
    return cachedMod.code;
  }

  const filename = posix.join(rootDir, id.slice(1));
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
    } else {
      return null;
    }
  }

  const cssImports: Set<string> = new Set();

  const build = await rollup({
    input: filename,
    plugins: [
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
      lmr(),
      esbuild(esbuildService),
    ],
    external: [LMR_JS_PATH_IMPORT],
    onwarn() {},
  });

  const { output } = await build.generate({
    sourcemap: false,
    format: "es" as const,
  });

  const mod = moduleGraph.ensure(id);
  mod.stale = false;

  const entryChunk = getEntryChunk(output);
  const virtualCssAsset = getCssAsset(output);

  if (virtualCssAsset) {
    virtualCssAsset.fileName = `$luath_${virtualCssAsset.fileName}`;
  }

  const realModules = Array.from(
    new Set([
      ...Object.keys(entryChunk.modules).map((path) => pathToId(path, rootDir))
        .filter((modId) => modId !== id),
      ...cssImports,
    ]),
  );

  if (isCssExtension(id)) {
    mod.acceptingUpdates = true;
    addRealModulesToGraph(moduleGraph, realModules, id);

    return mod.code = minifyCss(virtualCssAsset.source as string);
  } else if (isJsExtension(id)) {
    if (!virtualCssAsset) {
      addRealModulesToGraph(moduleGraph, realModules, id);

      return mod.code = entryChunk.code;
    }

    const cssId = pathToId(virtualCssAsset.fileName, rootDir);
    const cssMod = moduleGraph.ensure(cssId);
    cssMod.dependents.add(id);
    mod.dependencies.add(cssId);
    cssMod.code = minifyCss(virtualCssAsset.source as string);
    cssMod.stale = false;

    addRealModulesToGraph(moduleGraph, realModules, cssId);

    return mod.code = injectCss(
      entryChunk.code,
      virtualCssAsset.fileName,
    );
  }

  return code;
}

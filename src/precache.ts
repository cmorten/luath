import type { LuathPlugin } from "../types.ts";
import { exists, join } from "../deps.ts";
import { isLuathImport } from "./isLuathImport.ts";
import { pathToId } from "./pathToId.ts";
import { bundle } from "./middlewares/transform/bundle.ts";
import { ModuleGraph } from "./moduleGraph.ts";
import { parse } from "https://esm.sh/fast-html-parser@1.0.1";

export const precache = async (
  rootDir: string,
  moduleGraph: ModuleGraph,
  plugins: LuathPlugin[],
) => {
  try {
    const filename = join(rootDir, "index.html");

    if (await exists(filename)) {
      const html = await Deno.readTextFile(filename);
      const dom = parse(html);

      [...dom.querySelectorAll("script"), ...dom.querySelectorAll("link")]
        .forEach(
          ({ attributes }) => {
            const attribute = attributes.src ?? attributes.href;

            if (attribute && !isLuathImport(attribute)) {
              const url = pathToId(attribute, rootDir);

              populateCache(url, rootDir, moduleGraph, plugins).catch(() => {});
            }
          },
        );
    }
  } catch (_) {
    //swallow
  }
};

async function populateCache(
  url: string,
  rootDir: string,
  moduleGraph: ModuleGraph,
  plugins: LuathPlugin[],
) {
  const out = await bundle(url, rootDir, moduleGraph, plugins);

  if (out?.dependencies) {
    (Array.from(out.dependencies) as string[]).forEach(async (
      dependency: string,
    ) =>
      populateCache(dependency, rootDir, moduleGraph, plugins).catch(() => {})
    );
  }
}

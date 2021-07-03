import { luathPluginReactRefresh } from "../../mod.ts";
import { dirname, fromFileUrl, resolve } from "../../deps.ts";
import { rollupImportMapPlugin } from "https://deno.land/x/drollup@2.52.7+0.19.1/plugins/importmap/mod.ts";

const __dirname = dirname(fromFileUrl(import.meta.url));

export default ({ command }: { command: string }) => {
  switch (command) {
    case "serve": {
      return {
        plugins: [
          rollupImportMapPlugin({
            maps: resolve(__dirname, "./import_map.dev.json"),
          }),
          luathPluginReactRefresh(),
        ],
      };
    }
    case "build": {
      return {
        plugins: [
          rollupImportMapPlugin({
            maps: resolve(__dirname, "./import_map.prod.json"),
          }),
        ],
      };
    }
    case "run": {
      return {};
    }
  }
};

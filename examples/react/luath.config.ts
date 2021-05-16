import { luathPluginReactRefresh } from "../../mod.ts";
import { rollupImportMapPlugin } from "https://deno.land/x/drollup@2.42.3+0.17.1/plugins/importmap/mod.ts";

export default ({ command }: { command: string }) => {
  switch (command) {
    case "serve": {
      return {
        plugins: [
          rollupImportMapPlugin({ maps: "./import_map.dev.json" }),
          luathPluginReactRefresh(),
        ],
      };
    }
    case "build": {
      return {
        plugins: [
          rollupImportMapPlugin({ maps: "./import_map.prod.json" }),
        ],
      };
    }
    case "run": {
      return {};
    }
  }
};

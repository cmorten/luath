import type { LuathOptions } from "../types.ts";
import type { CLIOptions } from "./types.ts";
import { server } from "../server.ts";
import { handleError } from "../logging.ts";
import { getConfigPath } from "./getConfigPath.ts";
import { loadConfigFile } from "./loadConfigFile.ts";
import { DEFAULT_PORT } from "./constants.ts";
import { getRoot } from "./getRoot.ts";

export async function serve(
  { config, port, hostname }: CLIOptions,
  root: string,
) {
  let loadedConfig: LuathOptions = {};

  if (config) {
    try {
      const configFile = await getConfigPath(config);

      loadedConfig = await loadConfigFile(configFile, "serve");
    } catch (err) {
      handleError(err);
    }
  }

  hostname = hostname ?? loadedConfig?.server?.hostname;
  port = port ?? loadedConfig?.server?.port ?? DEFAULT_PORT;
  root = getRoot(root, loadedConfig);

  try {
    await server({
      ...loadedConfig,
      root,
      server: { ...loadedConfig?.server, port, hostname },
    });
  } catch (err) {
    handleError(err);
  }
}

import type { LuathOptions } from "../types.ts";
import type { CLIOptions } from "./types.ts";
import { build as _build } from "../build.ts";
import { handleError } from "../logging.ts";
import { getConfigPath } from "./getConfigPath.ts";
import { loadConfigFile } from "./loadConfigFile.ts";
import { getRoot } from "./getRoot.ts";

export async function build({ config }: CLIOptions, root: string) {
  let loadedConfig: LuathOptions = {};

  try {
    const configFile = await getConfigPath(config);

    loadedConfig = await loadConfigFile(configFile, "build");
  } catch (err) {
    if (config) {
      handleError(err);
    }
  }

  root = getRoot(root, loadedConfig);

  try {
    await _build({
      ...loadedConfig,
      root,
    });
  } catch (err) {
    handleError(err);
  }
}

import type { LuathOptions } from "../types.ts";
import type { CLIOptions } from "./types.ts";
import type { Server } from "../../deps.ts";
import { handleError } from "../logging.ts";
import { getConfigPath } from "./getConfigPath.ts";
import { loadConfigFile } from "./loadConfigFile.ts";
import { getHostname } from "./getHostname.ts";
import { getPort } from "./getPort.ts";
import { getRoot } from "./getRoot.ts";

export async function server(
  { config, port, hostname }: CLIOptions,
  root: string,
  commandName: string,
  serverFn: (options?: LuathOptions | undefined) => Promise<Server> | Server,
) {
  let loadedConfig: LuathOptions = {};

  try {
    const configFile = await getConfigPath(config);

    loadedConfig = await loadConfigFile(configFile, commandName);
  } catch (err) {
    if (config) {
      handleError(err);
    }
  }

  hostname = getHostname(hostname, loadedConfig);
  port = getPort(port, loadedConfig);
  root = getRoot(root, loadedConfig);

  try {
    const _server = await serverFn({
      ...loadedConfig,
      root,
      server: { ...loadedConfig?.server, port, hostname },
    });

    console.info(`listening on http://${hostname}:${port}`);

    await _server;
  } catch (err) {
    handleError(err);
  }
}

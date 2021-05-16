import type { LuathOptions } from "../types.ts";
import { Command } from "../../deps.ts";
import { version } from "../../version.ts";
import { server } from "../server.ts";
import { build as _build } from "../build.ts";
import { getConfigPath } from "./getConfigPath.ts";
import { loadConfigFile } from "./loadConfigFile.ts";
import { handleError } from "../logging.ts";

interface CLIOptions {
  config?: string | true;
  port?: number;
  hostname?: string;
}

const DEFAULT_PORT = 3000;

async function serve({ config, port, hostname }: CLIOptions, root: string) {
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
  root = root ?? loadedConfig?.root;

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

async function build({ config }: CLIOptions, root: string) {
  let loadedConfig: LuathOptions = {};

  if (config) {
    try {
      const configFile = await getConfigPath(config);

      loadedConfig = await loadConfigFile(configFile, "build");
    } catch (err) {
      handleError(err);
    }
  }

  root = root ?? loadedConfig?.root;

  try {
    await _build({
      ...loadedConfig,
      root,
    });
  } catch (err) {
    handleError(err);
  }
}

const program = await new Command()
  .name("luath")
  .version(version)
  .description("CLI for fast front-end development in Deno");

program.command("serve <root:string>")
  .description("Serve an application directory with HMR")
  .option(
    "-c, --config [filename:string]",
    "Use this config file (if argument is used but value is unspecified, defaults to luath.config.js)",
  )
  .option("-p, --port <port:number>", "Port to run the server on", {
    default: DEFAULT_PORT,
  })
  .option("-h, --hostname <hostname:string>", "Hostname to run the server on")
  .action(serve);

program.command("build <root:string>")
  .description("Build an application directory")
  .option(
    "-c, --config [filename:string]",
    "Use this config file (if argument is used but value is unspecified, defaults to luath.config.js)",
  )
  .action(build);

program.parse(Deno.args);

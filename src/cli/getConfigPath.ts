/**
 * Derived from <https://github.com/rollup/rollup/blob/v2.41.0/cli/run/getConfigPath.ts>
 */

import { resolve } from "../../deps.ts";

const DEFAULT_CONFIG_BASE = "luath.config";

export async function getConfigPath(
  commandConfig?: string | true,
): Promise<string> {
  if (commandConfig === true || typeof commandConfig === "undefined") {
    return resolve(await findConfigFileNameInCwd());
  }

  return resolve(commandConfig);
}

async function findConfigFileNameInCwd(): Promise<string> {
  try {
    const JS_FILE_NAME = `${DEFAULT_CONFIG_BASE}.js`;
    const { isFile } = await Deno.stat(JS_FILE_NAME);

    if (isFile) {
      return JS_FILE_NAME;
    }
  } catch {
    // Does not exist
  }

  return `${DEFAULT_CONFIG_BASE}.ts`;
}

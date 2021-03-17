import { toFileUrl } from "../../deps.ts";
import { handleError } from "./logging.ts";

export async function loadConfigFile(
  fileName: string,
): Promise<any> {
  const filePath = toFileUrl(fileName).href;

  let configFileExport;
  try {
    configFileExport =
      (await import(`${filePath}?cachebust=${+(new Date())}`)).default;
  } catch (_) {
    handleError({
      code: "MISSING_CONFIG",
      message: "could not find config file",
    });
  }

  return getConfigList(configFileExport);
}

async function getConfigList(
  configFileExport: unknown,
): Promise<any> {
  const config = typeof configFileExport === "function"
    ? await configFileExport()
    : configFileExport;

  if (typeof config !== "object") {
    handleError({
      code: "MISSING_CONFIG",
      message: "config file must export an options object",
    });
  }

  return config;
}

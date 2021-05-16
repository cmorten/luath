import type { CLIOptions } from "./types.ts";
import { server } from "./server.ts";
import { run as _run } from "../run.ts";

export function run(cliOptions: CLIOptions, root: string) {
  return server(cliOptions, root, "run", _run);
}

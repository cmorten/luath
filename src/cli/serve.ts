import type { CLIOptions } from "./types.ts";
import { server } from "../server.ts";
import { server as _server } from "./server.ts";

export function serve(cliOptions: CLIOptions, root: string) {
  return _server(cliOptions, root, "serve", server);
}

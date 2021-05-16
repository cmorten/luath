export const DEFAULT_PORT = 4505;
export const DEFAULT_HOSTNAME = "0.0.0.0";

export const defaultLuathOptions = {
  server: { port: DEFAULT_PORT, hostname: DEFAULT_HOSTNAME },
  root: Deno.cwd(),
};

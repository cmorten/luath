export const defaultLuathOptions = {
  server: { port: 3000 },
  root: Deno.cwd(),
  write: false,
  output: {
    dir: "./dist",
  },
};

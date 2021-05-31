import { esbuild } from "../../../deps.ts";

export async function transform(
  loader: esbuild.Loader,
  code: string,
  options: Record<string, unknown> = {},
) {
  const output = await esbuild.transform(code, {
    minify: true,
    loader,
    ...options,
  });

  return output.code;
}

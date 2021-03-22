// deno-lint-ignore-file no-explicit-any
import { terser } from "../../deps.ts";
import { esbuild } from "../plugins/esbuild.ts";
import { loadUrl } from "./loadUrl.ts";

let lmrClient: Promise<string>;

export async function getLmrClient() {
  if (lmrClient) {
    return lmrClient;
  }

  const importMetaUrl = import.meta.url;
  const clientUrl = new URL("./lmr/client.js", importMetaUrl);
  const raw = await loadUrl(clientUrl);
  const result = await terser().renderChunk(raw, undefined, {
    es: "format",
  } as any);

  return lmrClient = result.code;
}

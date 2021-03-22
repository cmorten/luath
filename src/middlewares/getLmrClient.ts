import { terser } from "../../deps.ts";
import { esbuild } from "../plugins/esbuild.ts";
import { loadUrl } from "./loadUrl.ts";

let lmrClient: Promise<string>;
const terserPlugin = terser();

getLmrClient();

export async function getLmrClient() {
  if (lmrClient) {
    return lmrClient;
  }

  const importMetaUrl = import.meta.url;
  const clientUrl = new URL("./lmr/client.js", importMetaUrl);
  const raw = await loadUrl(clientUrl);
  const result = await terserPlugin.renderChunk(raw, undefined, {
    es: "format",
  });

  return lmrClient = result.code;
}

// deno-lint-ignore-file no-explicit-any
import { loadUrl } from "./loadUrl.ts";

let lmrClient: Promise<string>;

export async function getLmrClient() {
  if (lmrClient) {
    return lmrClient;
  }

  const importMetaUrl = import.meta.url;
  const clientUrl = new URL("./lmr/client.js", importMetaUrl);

  return lmrClient = loadUrl(clientUrl);
}

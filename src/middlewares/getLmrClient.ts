import { loadUrl } from "./loadUrl.ts";

let lmrClient: Promise<string>;

export function getLmrClient() {
  if (lmrClient) {
    return lmrClient;
  }

  const importMetaUrl = import.meta.url;
  const clientUrl = new URL("./lmr/client.js", importMetaUrl);

  return lmrClient = loadUrl(clientUrl);
}

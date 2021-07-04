import { loadUrl } from "./loadUrl.ts";

let lmrClient: Promise<string>;

export function getLmrClient() {
  if (lmrClient) {
    return lmrClient;
  }

  return lmrClient = loadUrl(new URL("./lmr/client.js", import.meta.url));
}

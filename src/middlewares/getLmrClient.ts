const importMetaUrl = import.meta.url;

const clientUrl = new URL("./lmr/client.ts", importMetaUrl).href;

const { files: { ["deno:///bundle.js"]: lmrClient } } = await Deno.emit(
  clientUrl,
  { check: false, bundle: "esm" },
);

export function getLmrClient() {
  return lmrClient;
}

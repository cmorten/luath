import type { OutputAsset, OutputChunk, RollupOutput } from "../../../deps.ts";

export function getEntryChunk(output: RollupOutput["output"]) {
  return output.find((file: OutputChunk | OutputAsset) => {
    if ("isEntry" in file) {
      return file.isEntry;
    }

    return false;
  }) as OutputChunk;
}

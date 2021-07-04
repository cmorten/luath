import type { OutputChunk, RollupOutput } from "../../../deps.ts";

export function getEntryChunk(output: RollupOutput["output"]) {
  return output.find((file: any) => !!file.isEntry) as OutputChunk;
}

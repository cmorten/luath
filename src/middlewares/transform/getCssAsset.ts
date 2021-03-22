import type { OutputAsset, OutputChunk, RollupOutput } from "../../../deps.ts";
import { isCssExtension } from "../../isCss.ts";

export function getCssAsset(output: RollupOutput["output"]) {
  return output.find(({ type, fileName }: OutputChunk | OutputAsset) =>
    type === "asset" && isCssExtension(fileName)
  ) as OutputAsset;
}

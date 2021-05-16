import { luathPluginReactRefresh } from "../../mod.ts";

export default ({ command }: { command: string }) =>
  command === "serve"
    ? {
      plugins: [luathPluginReactRefresh()],
    }
    : {};

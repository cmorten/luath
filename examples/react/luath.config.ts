import { luathPluginReactRefresh } from "../../mod.ts";

export default ({ command }: { command: string }) => {
  switch (command) {
    case "serve": {
      return {
        plugins: [
          luathPluginReactRefresh(),
        ],
      };
    }
    default: {
      return {};
    }
  }
};

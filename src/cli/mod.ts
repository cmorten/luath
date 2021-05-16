import { Command } from "../../deps.ts";
import { version } from "../../version.ts";
import { DEFAULT_PORT } from "./constants.ts";
import { serve } from "./serve.ts";
import { build } from "./build.ts";

const configOption: [string, string] = [
  "-c, --config [filename:string]",
  "Use this config file (if argument is used but value is unspecified, defaults to luath.config.ts).",
];

function addServeCommand(program: Command) {
  program.option(...configOption)
    .option("-p, --port <port:number>", "Port to run the server on.", {
      default: DEFAULT_PORT,
    })
    .option(
      "-h, --hostname <hostname:string>",
      "Hostname to run the server on.",
    )
    .action(serve);
}

const program = await new Command()
  .name("luath")
  .version(version)
  .description("CLI for fast front-end development in Deno.");

addServeCommand(program);
addServeCommand(
  program.command("serve [root:string]").description(
    "Serve the application with HMR.",
  ),
);

program.command("build [root:string]")
  .description("Build the production assets.")
  .option(...configOption)
  .action(build);

program.parse(Deno.args);

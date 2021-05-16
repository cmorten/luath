import { Command } from "../../deps.ts";
import { version } from "../../version.ts";
import { DEFAULT_PORT } from "../constants.ts";
import { serve } from "./serve.ts";
import { build } from "./build.ts";
import { run } from "./run.ts";

const configOption: [string, string] = [
  "-c, --config [filename:string]",
  "Use this config file (if argument is used but value is unspecified, defaults to luath.config.ts).",
];

function addServeConfig(program: Command, addAction = true) {
  program.option(...configOption)
    .option("-p, --port <port:number>", "Port to run the server on.", {
      default: DEFAULT_PORT,
    })
    .option(
      "-h, --hostname <hostname:string>",
      "Hostname to run the server on.",
    );

  if (addAction) {
    program.action(serve);
  }

  return program;
}

const program = await new Command()
  .name("luath")
  .version(version)
  .description("CLI for fast front-end development in Deno.")
  .arguments("[root:string]");

addServeConfig(program);

const serveProgram = program.command("serve [root:string]").description(
  "Serve the application with HMR.",
);

addServeConfig(serveProgram);

program.command("build [root:string]")
  .description("Build the production assets.")
  .option(...configOption)
  .action(build);

const runProgram = program.command("run [root:string]")
  .description("Serve the production assets.");

addServeConfig(runProgram, false).action(run);

program.parse(Deno.args);

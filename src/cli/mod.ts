import { Command } from "../../deps.ts";
import { version } from "../../version.ts";
import { server } from "../server.ts";

interface ServeOptions {
  port?: number;
  hostname?: string;
}

const DEFAULT_PORT = 3000;

function notImplemented() {
  console.log("Not Implemented");
}

async function serve({ port, hostname }: ServeOptions, root: string) {
  await server({ root, server: { port: port ?? DEFAULT_PORT, hostname } });
}

async function build() {
  notImplemented();
}

const program = await new Command()
  .name("luath")
  .version(version)
  .description("CLI for fast front-end development in Deno");

program.command("serve <root:string>")
  .description("Serve an application directory with HMR [WIP]")
  .option("-p, --port <port:number>", "Port to run the server on", {
    default: DEFAULT_PORT,
  })
  .option("-h, --hostname <hostname:string>", "Hostname to run the server on")
  .action(serve);

program.command("build <root:string>")
  .description("Build an application directory [Not Implemented]")
  .action(build);

program.parse(Deno.args);

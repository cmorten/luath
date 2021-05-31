# ChangeLog

## [0.8.5] - 31-05-2021

- fix: upgrade of deno-rollup brought in a breaking change which normalized absolute ids to relative - see [rollup release notes](https://github.com/rollup/rollup/releases/tag/v2.44.0). Required to add `makeAbsoluteExternalsRelative: false` and fix some import parsing to maintain desired behaviour and id format within the luath module graph.

## [0.8.4] - 31-05-2021

- chore: upgrade deps

## [0.8.3] - 18-05-2021

- chore: no-op version release due to [failed publish](https://deno.land/status/60a2e23500009d3a007bebb9) of `0.8.2` to `deno.land/x` - [root cause provided by Deno Team](https://discord.com/channels/684898665143206084/689420767620104201/843974771150422026)

## [0.8.2] - 17-05-2021

- chore: no-op version release due to [failed publish](https://deno.land/status/60a2e10f00627501007bebb8) of `0.8.1` to `deno.land/x`

## [0.8.1] - 17-05-2021

- feat: automatically detect Luath config without having to provid flag if using the default naming convention in the root directory
- feat: add error code to error logging output
- feat: support Deno `1.10.2`
- docs: add new simple `react` example and move existing example to `react-importmap`

## [0.8.0] - 16-05-2021

- feat: add minimal support for importmap rollup plugin

## [0.7.0] - 16-05-2021

- feat: add `run` CLI command

## [0.6.0] - 16-05-2021

- feat: add `build` CLI command

## [0.5.1] - 28-03-2021

- docs: add a documentation site on GitHub pages

## [0.5.0] - 27-03-2021

- feat: write css to inline style tags to remove FOUC on load
- feat: introduce precache step on server startup to minimise first request round-trip time
- revert: remove terser as adding second to some builds
- fix: babel core issue with require not defined when served from esm.sh
- feat: make use of esm.sh `?dev` for prettier react imports in example
- fix: handle non-root files properly

## [0.4.0] - 23-03-2021

- revert: in-memory compression slow

## [0.3.2] - 23-03-2021

- chore: remove gif and preventing deno.land/x webhook publish due to size restrictions
- docs: add icon to readme
- chore: upgrade deno version in ci

## [0.3.1] - 22-03-2021

- chore: no-op release

## [0.3.0] - 22-03-2021

- feat: compress responses + other minor optimisations

## [0.2.6] - 17-03-2021

- fix: revert upgrade of server and ws versions to match those used in Opine otherwise ws server hangs due to type mismatch.

## [0.2.5] - 17-03-2021

- fix: ensure only call initialize on esbuild once from plugins as well as on startup.
- feat: prettified error logging in the Luath error middleware.

## [0.2.4] - 17-03-2021

- fix: ensure only call initialize on esbuild once.

## [0.2.3] - 17-03-2021

- docs: fix React example commands.
- feat: improved error message when cannot find config file.

## [0.2.2] - 17-03-2021

- docs: freshen up README and examples.
- chore: export React Refresh plugin and missing types from `mod.ts`.

## [0.2.1] - 17-03-2021

- chore: upgrade `std` and `esbuild` deps.

## [0.2.0] - 17-03-2021

- feat: luath config files for configuring development server.

## [0.1.1] - 16-03-2021

- chore: upgrade opine, deno-rollup and std deps.

## [0.1.0] - 16-03-2021

- feat: initial HMR server and `serve` CLI command.

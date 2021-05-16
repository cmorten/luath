# ChangeLog

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

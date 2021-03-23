<p align="center">
  <a href="https://www.linkedin.com/in/hannah-morten-b1218017a/"><img height="200" style="height:200px;" src="https://github.com/cmorten/luath/raw/main/.github/icon.svg" alt="Deno zooming through the lighting storm that is front-end development"></a>
  <h1 align="center">Luath</h1>
</p>
<p align="center">
  <i>Fast front-end development tooling in Deno.</i>
</p>
<p align="center">
   <img src="https://github.com/cmorten/luath/workflows/Test/badge.svg" alt="Current test status" />
   <a href="http://makeapullrequest.com"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs are welcome" /></a>
   <a href="https://github.com/cmorten/luath/issues/"><img src="https://img.shields.io/github/issues/cmorten/luath" alt="Luath issues" /></a>
   <img src="https://img.shields.io/github/stars/cmorten/luath" alt="Luath stars" />
   <img src="https://img.shields.io/github/forks/cmorten/luath" alt="Luath forks" />
   <img src="https://img.shields.io/github/license/cmorten/luath" alt="Luath license" />
   <a href="https://github.com/cmorten/luath/graphs/commit-activity"><img src="https://img.shields.io/badge/Maintained%3F-yes-green.svg" alt="Luath is maintained" /></a>
</p>
<p align="center">
   <a href="https://github.com/denoland/deno/blob/main/Releases.md"><img src="https://img.shields.io/badge/deno-^1.8.2-brightgreen?logo=deno" alt="Minimum supported Deno version" /></a>
   <a href="https://deno-visualizer.danopia.net/dependencies-of/https/raw.githubusercontent.com/cmorten/luath/main/mod.ts"><img src="https://img.shields.io/endpoint?url=https%3A%2F%2Fdeno-visualizer.danopia.net%2Fshields%2Fdep-count%2Fhttps%2Fraw.githubusercontent.com%2Fcmorten%2Fluath%2Fmain%2Fmod.ts" alt="Luath dependency count" /></a>
   <a href="https://deno-visualizer.danopia.net/dependencies-of/https/raw.githubusercontent.com/cmorten/luath/main/mod.ts"><img src="https://img.shields.io/endpoint?url=https%3A%2F%2Fdeno-visualizer.danopia.net%2Fshields%2Fupdates%2Fhttps%2Fraw.githubusercontent.com%2Fcmorten%2Fluath%2Fmain%2Fmod.ts" alt="Luath dependency outdatedness" /></a>
   <a href="https://deno-visualizer.danopia.net/dependencies-of/https/raw.githubusercontent.com/cmorten/luath/main/mod.ts"><img src="https://img.shields.io/endpoint?url=https%3A%2F%2Fdeno-visualizer.danopia.net%2Fshields%2Fcache-size%2Fhttps%2Fraw.githubusercontent.com%2Fcmorten%2Fluath%2Fmain%2Fmod.ts" alt="Luath cached size" /></a>
</p>

## Overview

Luath (`/l̪ˠuə/` - Scottish Gaelic for _fast_) is a front-end development and build tool for Deno with:

1. A [_WIP_] development server for serving your application via ESM with hot module replacement and support for a wide range of modern features.
1. A [_WIP_] build command for bundling your application code with [deno-rollup](https://github.com/cmorten/deno-rollup/).

## Features

- 👩‍💻 Quick Start CLI
- 🔥 Fast Hot Module Replacement (HMR)
- 🍣 Rollup Plugin Compatible
- 🗿 Static File Serving
- 👨‍🎤 JSX and TypeScript Support
- 🎨 PostCSS and CSS Module Support
- 📒 JSON and Image Import Support

## Installation

Luath can be used either through a command line interface (CLI):

```bash
# Install Luath
deno install -f -q -A --unstable --no-check https://deno.land/x/luath@0.3.2/luath.ts

# Serve the example
luath serve ./examples/vanilla
```

Or through it's JavaScript API:

```ts
import { server } from "https://deno.land/x/luath@0.3.2/mod.ts";

await server({ root: "./examples/vanilla" });
```

## Examples

Please refer to the [examples documentation](./examples).

## Contributing

Please refer to the [contributing guide](./.github/CONTRIBUTING.md)

---

## License

Luath is licensed under the [MIT License](./LICENSE.md).

Derived works include [vite](https://github.com/vitejs/vite) and [wmr](https://github.com/preactjs/wmr). The plan is to attribute specific segments in the appropriate files, but for now their licenses can be found in the root of this repository.

Icon designed and created by [Hannah Morten](https://www.linkedin.com/in/hannah-morten-b1218017a/).

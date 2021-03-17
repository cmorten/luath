<p align="center">
  <h1 align="center">Luath</h1>
</p>
<p align="center">
  For Deno front-end developers who like it fast
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
   <a href="https://github.com/denoland/deno/blob/main/Releases.md"><img src="https://img.shields.io/badge/deno-^1.8.0-brightgreen?logo=deno" alt="Minimum supported Deno version" /></a>
   <a href="https://deno-visualizer.danopia.net/dependencies-of/https/raw.githubusercontent.com/cmorten/luath/main/mod.ts"><img src="https://img.shields.io/endpoint?url=https%3A%2F%2Fdeno-visualizer.danopia.net%2Fshields%2Fdep-count%2Fhttps%2Fraw.githubusercontent.com%2Fcmorten%2Fluath%2Fmain%2Fmod.ts" alt="Luath dependency count" /></a>
   <a href="https://deno-visualizer.danopia.net/dependencies-of/https/raw.githubusercontent.com/cmorten/luath/main/mod.ts"><img src="https://img.shields.io/endpoint?url=https%3A%2F%2Fdeno-visualizer.danopia.net%2Fshields%2Fupdates%2Fhttps%2Fraw.githubusercontent.com%2Fcmorten%2Fluath%2Fmain%2Fmod.ts" alt="Luath dependency outdatedness" /></a>
   <a href="https://deno-visualizer.danopia.net/dependencies-of/https/raw.githubusercontent.com/cmorten/luath/main/mod.ts"><img src="https://img.shields.io/endpoint?url=https%3A%2F%2Fdeno-visualizer.danopia.net%2Fshields%2Fcache-size%2Fhttps%2Fraw.githubusercontent.com%2Fcmorten%2Fluath%2Fmain%2Fmod.ts" alt="Luath cached size" /></a>
</p>

---

## Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Examples](#examples)
- [Contributing](#contributing)
- [License](#license)

## Overview

Luath is a WIP project for providing fast front-end development tooling in Deno.

## Installation

Luath can be used either through a command line interface (CLI) or through it's JavaScript API.

### CLI

To install the CLI run:

```console
deno install -f -q -A --unstable https://deno.land/x/luath@0.1.1/luath.ts
```

And follow any suggestions to update your `PATH` environment variable.

You can then use the CLI to serve your application, just provide the directory to your `index.html`.

```console
luath serve --port 4000 ./examples/vanilla
```

### JavaScript API

You can import Luath straight into your project for providing a development server:

```ts
import { server } from "https://deno.land/x/luath@0.1.1/mod.ts";

await server();
```

## Examples

To run the [examples](./examples):

1. Clone the Luath repo locally:

   ```bash
   git clone git://github.com/cmorten/luath.git --depth 1
   cd luath
   ```

1. Install the Luath CLI:

   ```console
   deno install -f -q -A --unstable https://deno.land/x/luath@0.1.1/luath.ts
   ```

1. Then run the desired example by navigating to the directory and running the Luath `serve` command:

   ```bash
   cd examples/react
   luath serve ./ -c
   ```

1. Open <http://localhost:3000> in a browser

1. Start editing the example files and keep and an eye on the browser

## Contributing

[Contributing guide](./.github/CONTRIBUTING.md)

---

## License

Luath is licensed under the [MIT License](./LICENSE.md).

Derived works include [vite](https://github.com/vitejs/vite) and [wmr](https://github.com/preactjs/wmr). The plan is to attribute specific segments in the appropriate files, but for now their licenses can be found in the root of this repository.

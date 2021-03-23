# Examples

| Name                 | Description                                                                                                   |
| -------------------- | ------------------------------------------------------------------------------------------------------------- |
| [react](./react)     | A React example using the Luath plugin for [React Fast Refresh](https://www.npmjs.com/package/react-refresh). |
| [vanilla](./vanilla) | A no-framework "vanilla" example demonstrating CSS, JSON and image imports with HMR.                          |

## Getting Started

To run an example:

1. Clone the Luath repo locally:

   ```bash
   git clone git://github.com/cmorten/luath.git --depth 1
   cd luath
   ```

1. Install the Luath CLI:

   ```bash
   deno install -f -q -A --unstable --no-check https://deno.land/x/luath@0.3.2/luath.ts
   ```

1. Then run the desired example by navigating to the directory and running the appropriate Luath `serve` command:

   ```bash
   cd examples/react
   luath serve ./ -c
   ```

   The command required for each example is in the examples' README.

1. Open <http://localhost:3000> in a browser.

1. Start editing the example files and keep and an eye on the browser.

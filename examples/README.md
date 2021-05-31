<!-- deno-fmt-ignore-file -->
# Examples

| Name                 | Description                                                                                                   |
| -------------------- | ------------------------------------------------------------------------------------------------------------- |
| [react](./react)     | A React example using the Luath plugin for [React Fast Refresh](https://www.npmjs.com/package/react-refresh). |
| [react-importmap](./react-importmap)     | A React example using the Luath plugin for [React Fast Refresh](https://www.npmjs.com/package/react-refresh), and the Rollup [importmap](https://deno.land/x/drollup@2.50.5+0.18.1/plugins/importmap) plugin. |
| [vanilla](./vanilla) | A no-framework "vanilla" example demonstrating CSS, JSON and image imports with HMR.                          |

## Getting Started

To run an example:

1. Clone the Luath repo locally:

   ```bash
   git clone git://github.com/cmorten/luath.git --depth 1
   cd luath
   ```

2. Install the Luath CLI:

   ```bash
   deno install -fqA --unstable --no-check https://deno.land/x/luath@0.8.5/luath.ts
   ```

3. Then run the desired example by navigating to the directory and running the appropriate Luath `serve` command. E.g.

   ```bash
   cd examples/react
   luath serve
   ```

   The command required for each example is in the examples' README.

4. Open <http://0.0.0.0:4505> in a browser.

5. Start editing the example files and keep and an eye on the browser.

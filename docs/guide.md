---
layout: documentation
title: Luath | Guide
lang: en
---

<main class="main doc-main">
  <section class="section">
    <h1 id="getting-started">Getting Started</h1>
    <section class="subsection">
      <h2 id="overview">Overview</h2>
      <p>Luath ( <code>/l̪ˠuə/</code> - Scottish Gaelic for <i>fast</i> ) is a front-end development and build tool for Deno with:</p>
      <ol>
        <li>A development server for serving your application via ESM with hot module replacement and support for a wide range of modern features.</li>
        <li>A build command for bundling your application code with <a href="https://github.com/cmorten/deno-rollup/"><code>deno-rollup</code></a>.</li>
      </ol>
    </section>
    <section class="subsection">
      <h2 id="running-your-first-luath-project">Running Your First Luath Project</h2>
      <p>Install the Luath CLI using <a href="https://deno.land/">Deno</a>:</p>
      <pre><code>$ deno install -fqA --unstable https://deno.land/x/luath@0.9.0/luath.ts</code></pre>
      <p>Then follow any prompts from the Deno command. For example, you may need to add the Deno bin directory to your path:</p>
      <pre><code>$ export PATH="$HOME/.deno/bin:$PATH"</code></pre>
      <p>You are now set to use Luath. Let's try it out with one of the Luath repo examples:</p>
      <ol>
        <li>Clone the Luath repo locally:</li>
        <pre><code>$ git clone git://github.com/cmorten/luath.git --depth 1</code></pre>
        <li>Navigate to the desired example:</li>
        <pre><code>$ cd luath/examples/react</code></pre>
        <li>Run the example with the <code>luath serve</code> command:</li>
        <pre><code>$ luath serve</code></pre>
        <li>Open <a href="http://localhost:4505"><code>http://localhost:4505</code></a> in a browser.</li>
        <li>Start editing some of the example files and keep an eye on the browser!</li>
      </ol>
    </section>
    <section class="subsection">
      <h2 id="cli">CLI</h2>
      <p>To view the available commands and flags for the Luath CLI you can use the <code>luath --help</code> command:</p>
      <pre><code>$ luath --help

  Usage:   luath [root:string]
  Version: v0.9.0

  Description:

      CLI for fast front-end development in Deno.

  Options:

      -h, --help                  - Show this help.
      -V, --version               - Show the version number for this program.
      -c, --config    [filename]  - Use this config file (if argument is used but value is unspecified, defaults to luath.config.ts).
      -p, --port      &lt;port&gt;      - Port to run the server on. (Default: 4505)
      -h, --hostname  &lt;hostname&gt;  - Hostname to run the server on.  (Default: "0.0.0.0")

  Commands:

      serve  [root]  - Serve the application with HMR.
      build  [root]  - Build the production assets.
      run    [root]  - Serve the production assets.
  </code></pre>
    <p>For help with subcommands similarly provide the help flag, for example <code>luath serve --help</code>.</p>
    </section>
    <section class="subsection">
      <h2 id="getting-involved">Getting Involved</h2>
      <p>Please refer to the Luath repo's <a href="https://github.com/cmorten/luath/blob/main/.github/CONTRIBUTING.md">contributing guide</a>.</p>
      <p>If you need help or have any queries, reach out to the Deno community on the <a href="https://discord.com/channels/684898665143206084/689420767620104201">Deno Discord</a> or <a href="https://github.com/cmorten/luath/issues">GitHub Issues</a>.</p>
    </section>
  </section>
  <section class="section">
    <h1 id="features">Features</h1>
    <section class="subsection">
      <h2 id="hot-module-replacement">Hot Module Replacement</h2>
      <p>Luath provides Hot Module Replacement ( HMR ) over ESM to allow updates to an application without needing to refresh the page, letting you focus on your code and yeilding faster iteration. Via the plugin system, you easily use the first-party HMR integration for <a href="https://github.com/facebook/react/issues/16604#issuecomment-528663101">React Fast Refresh</a> or any compatible third-party integration.</p>
      <p>The Luath HMR works by setting up a Web Socket ( WS ) connection between the Luath server and the client, and then setting up a file watcher which signals to the client when a file has been modified, created or removed. When the client receives the signal from the WS, it then re-imports the appropriate modules, updating your live application without the need to refresh the page.</p>
    </section>
    <section class="subsection">
      <h2 id="jsx-and-typescript">JSX And TypeScript</h2>
      <p>Luath supports the use of <code>.ts</code>, <code>.jsx</code> and <code>.tsx</code> files out of the box.</p>
      <p>This support is provided by <a href="https://github.com/cmorten/deno-rollup/"><code>deno-rollup</code></a>, initially using the built-in JSX and TypeScript loader which interally invokes the <code>Deno.emit()</code> API before gracefully transitioning to a lazy-loaded <a href="https://esbuild.github.io/"><code>esbuild</code></a> plugin. This allows Luath to transpile your code at a great pace, often with HMR updates live in the browser within 10 - 50ms.</p>
    </section>
    <section class="subsection">
      <h2 id="postcss-and-css-modules">PostCSS And CSS Modules</h2>
      <p>Luath supports the use of <code>.css</code> files out the box, with automatic <code>&lt;link&gt;</code> and <code>&lt;style&gt;</code> injection and HMR support.</p>
      <p><code>.css</code> files imported into code are automatically treated as CSS Modules, and you can retrieve the processed CSS class names from properties on the default export. The full processed CSS string can also be accessed via the name <code>stylesheet</code> export.</p>
      <pre><code>// style.css
        <br />.darkMode { background: #2d2d2d; }</code></pre>
      <pre><code>// mod.ts
        <br />import styles, { stylesheet } from "./style.css";
        <br />
        <br />// Access processed CSS as a string
        <br />console.log(stylesheet);
        <br />
        <br />// Access processed CSS class names
        <br />document.body.classList.add(styles.darkMode)</code></pre>
      <p>CSS Module support is provided by the <a href="https://github.com/cmorten/deno-rollup"><code>deno-rollup</code></a> <a href="https://github.com/cmorten/deno-rollup/tree/main/plugins/postcss"><code>postcss</code></a> plugin.</p>
      <p>Luath is also configured to support CSS <code>@import</code> statements, and will inline imported CSS using <a href="https://github.com/postcss/postcss-import"><code>postcss-import</code></a>. Updates to imported CSS will result in HMR of the appropriate styles, providing instant feedback as you style your application.</p>
      <p>CSS imported into your application by <code>&lt;link&gt;</code> tags in your <code>index.html</code> also benefit from the same PostCSS processing and HMR as direct CSS imports into your code.</p>
    </section>
    <section class="subsection">
      <h2 id="json">JSON</h2>
      <p>Luath supports the use of <code>.json</code> files out the box, with automatic HMR support.</p>
      <pre><code>// Import entire JSON object
        <br />import json from "./fixture.json";
        <br />
        <br />// Import a named export from the JSON object
        <br />import { prop } from "./fixture.json";</code></pre>
      <p>JSON support is provided by the <a href="https://github.com/cmorten/deno-rollup"><code>deno-rollup</code></a> <a href="https://github.com/cmorten/deno-rollup/tree/main/plugins/json"><code>json</code></a> plugin.</p>
    </section>
    <section class="subsection">
      <h2 id="images">Images</h2>
      <p>Luath supports the use of <code>.jpg</code>, <code>.png</code>, <code>.gif</code>, <code>.svg</code>, and <code>.webp</code> files out the box, with automatic HMR support. These can be imported into your code as base64 encoded images. Note that this means they will be 33% larger than the size on disk, so this feature is best used only for small images.</p>
      <pre><code>import icon from "./icon.png";
      <br />const iconElement = document.createElement("image");
      <br />iconElement.src = icon;
      <br />document.body.appendChild(iconElement);</code></pre>
      <p>Image support is provided by the <a href="https://github.com/cmorten/deno-rollup"><code>deno-rollup</code></a> <a href="https://github.com/cmorten/deno-rollup/tree/main/plugins/image"><code>image</code></a> plugin.</p>
    </section>
    <section class="subsection">
      <h2 id="static-file-serving">Static File Serving</h2>
      <p>All assets in the root directory of your application will be served by Luath, meaning you can access them on the root path <code>/</code> of the server.</p>
      <p>If you have assets that you want to be served by Luath, but without any processing and bundling ( e.g. <code>robots.txt</code> ) then you can place the assets in a <code>./public</code> directory in the project root. All assets in the <code>./public</code> directory will be statically served on the root path <code>/</code> of the server as-is.</p>
    </section>
  </section>
</main>

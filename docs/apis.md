---
layout: documentation
title: Luath | APIs
lang: en
---

<main class="main doc-main">
  <section class="section">
    <h1 id="getting-started">APIs</h1>
    <section class="subsection">
      <h2 id="javascript-api">JavaScript API</h2>
      <h3><code>server: (options?: LuathOptions) => Promise</code></h3>
      <p>Create a Luath server with custom options. Resolves to an <a href="https://github.com/asos-craigmorten/opine"><code>opine</code></a> server.</p>
      <p>For example:</p>
      <pre><code>import { server } from "https://deno.land/x/luath@0.6.0/mod.ts";
      <br />import { plugins } from "./plugins.ts";
      <br />await server({ root: Deno.cwd(), server: { port: 4000 }, plugins });</code></pre>
      <h3><code>build: (options?: LuathOptions) => Promise</code></h3>
      <p>Builds the production assets.</p>
      <p>For example:</p>
      <pre><code>import { build } from "https://deno.land/x/luath@0.6.0/mod.ts";
      <br />import { plugins } from "./plugins.ts";
      <br />await build({ root: Deno.cwd(), plugins });</code></pre>
    </section>
    <section class="subsection">
      <h2 id="plugin-api">Plugin API</h2>
      <p>Luath makes use of <a href="https://github.com/cmorten/deno-rollup/"><code>deno-rollup</code></a> internally for transpiling and bundling code, utilizing Rollup's well-designed plugin interface for providing features. As a result, any plugin that is compatible with <a href="https://github.com/cmorten/deno-rollup/"><code>deno-rollup</code></a> is also immediately compatible with Luath.</p>
      <p>To learn more about Rollup plugins, please refer to the official <a href="https://rollupjs.org">Rollup documentation</a>.</p>
      <p>In addition to the core Rollup plugin APIs, Luath also supports an additional optional hook:</p>
      <h3><code>transformIndexHtml?: (html: string) => string</code></h3>
      <p>A hook dedicated to transforming the <code>index.html</code>. It receives the current HTML as a string and should return a transformed HTML string.</p>
      <p>For example:</p>
      <pre><code>const htmlTitleReplacerPlugin = (title: string) => {
      <br />  return {
      <br />    name: 'luath-html-title-replacer-plugin',
      <br />    transformIndexHtml(html) {
      <br />      return html.replace(
      <br />        /&lt;title&gt;(.*?)&lt;\/title&gt;/,
      <br />        `&lt;title&gt;${title}&lt;/title&gt;`,
      <br />      );
      <br />    },
      <br />  };
      <br />};</code></pre>
    </section>
    <section class="subsection">
      <h2 id="configuration">Configuration</h2>
      <p>When running a Luath application using the CLI, you can provide a configuration file via the <code>--config</code> flag in the <code>luath serve</code> command.</p>
      <p>Similarly, configuration can also be passed to the Luath <a href="/luath/apis#javascript-apis">JavaScript APIs</a>.</p>
      <p>The simplest configuration file just exports an empty object:</p>
      <pre><code>// luath.config.ts
      <br />export default {};</code></pre>
      <p>Conditional configuration can be implemented based on the <code>command</code> (<code>build</code> or <code>serve</code>) by exporting a function:</p>
      <pre><code>// luath.config.ts
      <br />export default ({ command }: { command: string }) => {
      <br />  return command === "build"
      <br />    ? { /* ...build specific config... */ }
      <br />    : { /* ...serve specific config... */ };
      <br />};</code></pre>
      <p>Available configuration options are:</p>
      <h3><code>root?: string</code></h3>
      <p>Default: <code>Deno.cwd()</code></p>
      <p>Project root directory for the Luath server.</p>
      <h3><code>server?: LuathServerOptions</code></h3>
      <p>Default: <code>{ port: 3000 }</code></p>
      <p>Luath server options. Accepts any valid <code>HTTPOptions</code> or <code>HTTPSOptions</code> from the Deno <code>http</code> standard library.</p>
      <h3><code>plugins?: LuathPlugin[]</code></h3>
      <p>Default: <code>undefined</code></p>
      <p>An array of Luath plugins to use. Please refer to the <a href="/luath/apis#plugin-api">Plugin API</a> documentation for further details.</p>
    </section>
  </section>
</main>

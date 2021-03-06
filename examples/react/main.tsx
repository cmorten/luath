/// <reference lib="dom" />
// @deno-types="https://cdn.esm.sh/v15/@types/react@17.0.0/index.d.ts"
import React from "https://cdn.esm.sh/v15/react@17.0.1/esnext/react.development.js";
// @deno-types="https://cdn.esm.sh/v15/@types/react-dom@17.0.0/index.d.ts"
import ReactDOM from "https://cdn.esm.sh/v15/react-dom@17.0.1/esnext/react-dom.development.js";
import { App } from "./app.tsx";

ReactDOM.render(
  <App />,
  document.getElementById("app"),
);

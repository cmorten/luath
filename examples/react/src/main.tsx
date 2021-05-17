/// <reference lib="dom" />
import React from "https://esm.sh/react@17.0.2?dev";
import ReactDOM from "https://esm.sh/react-dom@17.0.2?dev";
import "./style.css";
import App from "./app.tsx";

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("app"),
);

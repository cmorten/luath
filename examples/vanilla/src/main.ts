/// <reference lib="dom" />
// deno-lint-ignore-file ban-ts-comment
// @ts-nocheck
import metadata from "./metadata.json";
import icon from "../public/icon.png";
import shared from "./shared.css";
import styles from "./main.css";

document.querySelector(`#app`)!.innerHTML = `
  <h1 class="${shared.title}">Hello Luath!</h1>
  <img class="${styles.icon}" alt="Deno zooming through the lighting storm that is front-end development" src="${icon}" />
  <p class="${styles.meta}">Project Metadata: ${
  JSON.stringify(metadata, undefined, 2)
}</p>
  <p class="${styles.intro}">Edit <code>main.ts</code> and save to try out the HMR!</p>
  `;

if (import.meta.hot) {
  import.meta.hot.accept();
}

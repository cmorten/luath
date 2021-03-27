/// <reference lib="dom" />
// @ts-nocheck
import metadata from "./metadata.json"
import icon from "./icon.png";
import shared from "./shared.css";
import styles from "./main.css";

document.querySelector(`#app`)!.innerHTML = `
  <h1 class="${shared.title}">Hello Deno!</h1>
  <img class="${styles.icon}" src="${icon}" />
  <p class="${styles.meta}">Project Metadata: ${JSON.stringify(metadata, undefined, 2)}</p>
  <p class="${styles.intro}">Try changing one of the files!</p>
  `;

if (import.meta.hot) {
  import.meta.hot.accept();
}
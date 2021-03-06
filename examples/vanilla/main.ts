import metadata from "./metadata.json"
import icon from "./icon.png";
import sharedStyles from "./shared.css";
import styles from "./main.css";

// @ts-ignore
document.querySelector(`#app`).innerHTML = `
  <h1 class="${sharedStyles.title}">Hello Deno!</h1>
  <img class="${styles.icon}" src="${icon}" />
  <p class="${styles.meta}">Project Metadata: ${JSON.stringify(metadata, undefined, 2)}</p>
  <p class="${styles.intro}">Coming soon...!</p>
  `;

if (import.meta.hot) {
  import.meta.hot.accept();
}
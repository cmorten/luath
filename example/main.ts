import titleStyles from "./title.css";
import introStyles from "./intro.css";

// @ts-ignore
document.querySelector(`#app`).innerHTML = `
  <h1 class="${titleStyles.title}">Hello Deno!</h1>
  <p class="${introStyles.intro}">Coming soon...!</p>
  `;

import.meta.hot.accept();

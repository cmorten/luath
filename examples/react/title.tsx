// @deno-types="https://cdn.esm.sh/v15/@types/react@17.0.0/index.d.ts"
import React from "https://cdn.esm.sh/v15/react@17.0.1/esnext/react.development.js";
import styles from "./title.css";

export const Title = () => {
  const [counter, setCounter] = React.useState(0);

  return (
    <header className={styles.header} onClick={() => setCounter(counter + 1)}>
      <h1 className={styles.text}>Deno Doggo List - Tap To Count The Doggos {counter}</h1>
    </header>
  );
};

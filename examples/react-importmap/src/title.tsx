import React from "react";
import styles from "./title.css";

export const Title = () => {
  const [counter, setCounter] = React.useState(0);

  return (
    <header className={styles.header} onClick={() => setCounter(counter + 1)}>
      <h1 className={styles.text}>
        Deno Doggo List - Tap To Count The Doggos {counter}
      </h1>
    </header>
  );
};

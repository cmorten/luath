import React, { useState } from "https://esm.sh/react@17.0.2?dev";
import logo from "./logo.svg";
import styles from "./app.css";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <img src={logo} className={styles.logo} alt="React logo" />
        <p>Hello Luath!</p>
        <p>
          <button onClick={() => setCount((count) => count + 1)}>
            Click count is: {count}
          </button>
        </p>
        <p>
          Edit <code>app.tsx</code> and save to test HMR updates.
        </p>
        <p>
          <a
            className={styles.link}
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
          {" | "}
          <a
            className={styles.link}
            href="https://cmorten.github.io/luath/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Luath Docs
          </a>
        </p>
      </header>
    </div>
  );
}

export default App;

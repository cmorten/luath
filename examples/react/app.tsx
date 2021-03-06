// @deno-types="https://cdn.esm.sh/v15/@types/react@17.0.0/index.d.ts"
import React from "https://cdn.esm.sh/v15/react@17.0.1/esnext/react.development.js";
import { Title } from "./title.tsx";
import { List } from "./list.tsx";

export const App = () => {
  return (<>
    <Title />
    <List />
  </>);
};

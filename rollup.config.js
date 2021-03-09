import { nodeResolve } from "@rollup/plugin-node-resolve";

export default [
  {
    plugins: [nodeResolve()],
    input: "index.js",
    output: [{ file: "main.js", format: "es" }],
  },
];

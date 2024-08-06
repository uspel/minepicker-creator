import { defineConfig, Plugin } from "rollup";
import { rmSync } from "fs";

import externals from "rollup-plugin-node-externals";
import ts from "rollup-plugin-ts";
import json from "@rollup/plugin-json";
import terser from "@rollup/plugin-terser";

export default defineConfig({
  watch: {
    include: "src/**/*",
  },
  input: "src/cli.ts",
  output: {
    dir: "build",
    format: "esm",
  },
  plugins: [clean(), externals(), ts(), json(), terser()],
});

function clean(): Plugin {
  return {
    name: "clean",
    async buildStart() {
      rmSync("./build", { force: true, recursive: true });
    },
  };
}

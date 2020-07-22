import { terser } from "rollup-plugin-terser";
import babel from "rollup-plugin-babel";
import postcss from "rollup-plugin-postcss";
import autoprefixer from "autoprefixer";
import Utils from "rollup-plugin-app-utils";
import nodeResolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import replace from "rollup-plugin-replace";

console.log("Runing build: ", process.env.NODE_ENV);
export default {
  input: "./src/Multiselect.ts",
  output: [
    {
      sourcemap: true,
      format: "umd",
      name: "Multiselect",
      file: "./dist/multiselect.js",
      plugins: []
    },
    {
      format: "umd",
      file: "./dist/min/multiselect.min.js",
      name: "Multiselect",
      plugins: [terser()]
    }
  ],
  plugins: [
    Utils.prepareDirectories("dist"),
    replace({
      "process.env.NODE_ENV": JSON.stringify(
        process.env.NODE_ENV === "production" ? "production" : "development"
      )
    }),
    postcss({
      minimize: process.env.NODE_ENV === "production" ? true : false,
      sourceMap: process.env.NODE_ENV === "production" ? false : true,
      extract: true,
      plugins: [autoprefixer]
    }),
    typescript(),
    babel({
      exclude: "node_modules/**"
    }),
    commonjs(),
    nodeResolve()
  ],
  watch: {
    chokidar: false
  }
};

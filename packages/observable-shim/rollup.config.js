import sourcemaps from "rollup-plugin-sourcemaps";
import nodeResolve from "@rollup/plugin-node-resolve";
import postcss from "rollup-plugin-postcss";
import { globals } from "@hpcc-js/bundle";

import pkg from "./package.json";

const plugins = [
    nodeResolve({
        preferBuiltins: true,
    }),
    sourcemaps(),
    postcss({
        extensions: [".css"],
        extract: true,
        minimize: true
    })
];

function config(name) {
    return {
        input: `lib-es6/${name}.js`,
        output: [{
            file: `dist/${name}.js`,
            format: "es",
            sourcemap: true,
            globals
        }],
        treeshake: {
            moduleSideEffects: (id, external) => {
                if (id.indexOf(".css") >= 0) return true;
                return false;
            }
        },
        plugins: plugins
    };
}

export default [
    config("parser"),
    config("stdlib"),
    config("runtime"),
    config("inspector")
];

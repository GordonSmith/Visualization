import alias from "@rollup/plugin-alias";
import sourcemaps from "rollup-plugin-sourcemaps";
import nodeResolve from "@rollup/plugin-node-resolve";
import postcss from "rollup-plugin-postcss";
import { globals } from "@hpcc-js/bundle";

const plugins = [
    alias({
        entries: [
        ]
    }),
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

export default [{
    input: "lib-es6/index",
    external: (id, parentId, isResolved) => id.indexOf("http") === 0,
    output: [{
        dir: "dist",
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
    plugins
}];

import { external, globals } from "@hpcc-js/bundle";
import alias from "@rollup/plugin-alias";
import commonjs from "@rollup/plugin-commonjs";
import sourcemaps from "rollup-plugin-sourcemaps";
import nodeResolve from "@rollup/plugin-node-resolve";
import postcss from "rollup-plugin-postcss";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const pkg = require("./package.json");

const plugins = [
    alias({
        entries: [
        ]
    }),
    nodeResolve({
        preferBuiltins: true
    }),
    commonjs({}),
    sourcemaps()
];

export default [{
    input: "lib-es6/browser/index",
    external: external,
    output: [{
        file: pkg.browser,
        format: "umd",
        sourcemap: true,
        globals: globals,
        name: pkg.name
    }, {
        file: pkg.module + ".js",
        format: "es",
        sourcemap: true,
        globals: globals
    }],
    treeshake: {
        moduleSideEffects: false
    },
    plugins: [
        ...plugins,
        postcss({
            extensions: [".css"],
            minimize: true
        })]
}, {
    input: "lib-es6/node/index",
    external: external,
    output: [{
        file: pkg.main,
        format: "cjs",
        sourcemap: true,
        globals: globals,
        name: pkg.name
    }, {
        file: pkg.main.split(".node.").join(".node.es6."),
        format: "es",
        sourcemap: true,
        globals: globals
    }],
    treeshake: {
        moduleSideEffects: []
    },
    plugins
}, {
    input: "lib-es6/__tests__/index",
    external: external,
    output: [{
        file: "dist/test.node.js",
        format: "cjs",
        sourcemap: true,
        globals: globals,
        name: pkg.name
    }],
    plugins
}];
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
            { find: "@hpcc-js/common", replacement: "@hpcc-js/common/lib-es6/index.js" }
        ]
    }),
    nodeResolve({
        preferBuiltins: true
    }),
    commonjs({}),
    sourcemaps(),
    postcss({
        extensions: [".css"],
        minimize: true
    })
];

export default [{
    input: "lib-es6/index",
    output: [{
        file: pkg.browser,
        format: "umd",
        sourcemap: true,
        name: pkg.name
    }, {
        file: pkg.module + ".js",
        format: "es",
        sourcemap: true,
    }],
    treeshake: {
        moduleSideEffects: []
    },
    plugins: plugins
}, {
    input: "lib-es6/index.node",
    output: [{
        file: pkg.main,
        format: "cjs",
        sourcemap: true,
        name: pkg.name
    }, {
        file: pkg.main.split(".node.").join(".node.es6."),
        format: "es",
        sourcemap: true,
    }],
    treeshake: {
        moduleSideEffects: []
    },
    plugins: plugins
}];
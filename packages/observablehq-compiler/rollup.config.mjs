import { external, globals } from "@hpcc-js/bundle";
import alias from "@rollup/plugin-alias";
import commonjs from "@rollup/plugin-commonjs";
import sourcemaps from "rollup-plugin-sourcemaps";
import nodeResolve from "@rollup/plugin-node-resolve";
import postcss from "rollup-plugin-postcss";
import json from "@rollup/plugin-json";
import pkg from "./package.json" assert { type: 'json' };;

// eslint-disable-next-line @typescript-eslint/no-var-requires

const plugins = [
    json(),
    alias({
        entries: [
        ]
    }),
    nodeResolve({
        preferBuiltins: true
    }),
    commonjs({}),
    sourcemaps(),
    postcss({
        extensions: [".css"],
        extract: true,
        minimize: true
    })
];

export default [{
    input: "lib-es6/index",
    external: (id, _parentId, _isResolved) => id.indexOf("http") === 0 || external(id),
    output: [{
        dir: "dist",
        entryFileNames: "[name].esm.js",
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
    external: (id, parentId, isResolved) => id.indexOf("http") === 0 || external(id),
    output: [{
        dir: "dist-test",
        format: "es",
        sourcemap: true,
        globals: globals,
        name: pkg.name
    }],
    plugins: [
        ...plugins,
    ]
}];
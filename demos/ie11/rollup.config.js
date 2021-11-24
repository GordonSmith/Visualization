import alias from "@rollup/plugin-alias";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import nodeResolve from "@rollup/plugin-node-resolve";
import sourcemaps from "rollup-plugin-sourcemaps";
import postcss from "rollup-plugin-postcss";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const pkg = require("./package.json");

const isHpcc = (id) => id.indexOf("@hpcc-js") === 0;
const isShim = (id) => isHpcc(id) && id.indexOf("-shim") > 0;
function external(id) {
    return (isHpcc(id) && !isShim(id)) || id.indexOf(".json") > 0;
}

function globals(id) {
    if (id.indexOf("@hpcc-js") === 0) {
        return id;
    }
    return undefined;
}
const browserTpl = (input, umdOutput, esOutput) => ({
    input: input,
    // external,
    output: [{
        file: umdOutput,
        format: "umd",
        sourcemap: true,
        globals,
        name: pkg.name,
        strict: false
    }],
    plugins: [
        alias({
            entries: [
                // { find: "@hpcc-js/util", replacement: "../../packages/util/dist/index.js" },
                // { find: "@hpcc-js/common", replacement: "../../packages/common/dist/index.js" },
                // { find: "@hpcc-js/api", replacement: "../../packages/api/dist/index.js" },
                // { find: "@hpcc-js/chart", replacement: "../../packages/chart/dist/index.js" },
                // { find: "@hpcc-js/codemirror", replacement: "../../packages/codemirror/dist/index.js" },
                // { find: "@hpcc-js/html", replacement: "../../packages/html/dist/index.js" },
                // { find: "@hpcc-js/react", replacement: "../../packages/react/dist/index.js" },
                // { find: "@hpcc-js/graph", replacement: "../../packages/graph/dist/index.js" },
                // { find: "@hpcc-js/dgrid", replacement: "../../packages/dgrid/dist/index.js" },
                // { find: "@hpcc-js/layout", replacement: "../../packages/layout/dist/index.js" },
                // { find: "@hpcc-js/phosphor", replacement: "../../packages/phosphor/dist/index.js" },
            ]
        }),
        nodeResolve({
            preferBuiltins: true
        }),
        commonjs({}),
        json({}),
        postcss({
            extensions: [".css"],
            minimize: true
        }),
        sourcemaps(),
    ]
});

export default [
    browserTpl("lib-es6/client/index", pkg.browser, pkg.module)
];
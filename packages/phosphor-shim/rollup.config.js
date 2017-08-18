const rollup = require('rollup');
const resolve = require('rollup-plugin-node-resolve');
const postcss = require('rollup-plugin-postcss');
const commonjs = require("rollup-plugin-commonjs");
const alias = require('rollup-plugin-alias');
const sourcemaps = require('rollup-plugin-sourcemaps');

export default {
    entry: 'lib-es6/index.js',
    format: 'umd',
    moduleName: "hpcc-js-phosphor-shim",
    dest: 'dist/phosphor-shim.js',
    plugins: [
        resolve({
            jsnext: true,
            main: true
        }),
        postcss({
            plugins: [],
            extensions: ['.css']  // default value
        }),
        commonjs({
            namedExports: {
                "@phosphor/widgets": ["CommandRegistry", "Message", "CommandPalette", "ContextMenu", "DockPanel", "SplitPanel", "Menu", "MenuBar", "Widget"]
            },
            ignore: ['crypto']
        }),
        sourcemaps()
    ]
};

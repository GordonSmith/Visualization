var DojoWebpackPlugin = require("dojo-webpack-plugin");

var path = require("path");
var webpack = require("webpack");

module.exports = {
    context: __dirname,
    entry: "./lib-amd/index.js",
    output: {
        path: path.join(__dirname, "build"),
        publicPath: "build/",
        pathinfo: true,
        libraryTarget: "commonjs2",
        library: "@hpcc-js/dgrid-shim",
        filename: "dgrid-shim.js"
    },
    module: {
        loaders: [
            {
                test: /\.(png)|(gif)$/, loader: "url-loader?limit=100000"
            }, {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            }, {
                test: /.(ttf|otf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
                use: [{
                    loader: 'file-loader',
                    options: {
                        name: './build/[name].[ext]'
                    }
                }]
            }]
    },
    plugins: [
        new DojoWebpackPlugin({
            loaderConfig: require.resolve("./src/loaderConfig"),
            environment: { dojoRoot: "release" },	// used at run time for non-packed resources (e.g. blank.gif)
            buildEnvironment: { dojoRoot: "../../node_modules" }, // used at build time
            locales: ["en"]
        }),
        // For plugins registered after the DojoAMDPlugin, data.request has been normalized and
        // resolved to an absMid and loader-config maps and aliases have been applied
        new webpack.NormalModuleReplacementPlugin(/^dojox\/gfx\/renderer!/, "dojox/gfx/canvas"),
        new webpack.NormalModuleReplacementPlugin(
            /^css!/, function (data) {
                data.request = data.request.replace(/^css!/, "!style-loader!css-loader!")
            }
        ),
        new webpack.optimize.UglifyJsPlugin({
            output: { comments: false },
            compress: { warnings: false },
            sourceMap: true
        })
    ],
    resolveLoader: {
        modules: [
            path.join(__dirname, "../../node_modules")
        ]
    },
    devtool: "#source-map",
    node: {
        process: false,
        global: false
    }
};

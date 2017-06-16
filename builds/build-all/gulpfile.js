"use strict";

const gulp = require('gulp');
const fs = require('fs');
const argv = require('yargs').argv;
const shell = require('gulp-shell')
const runSequence = require('run-sequence');
const rimraf = require('rimraf'); // rimraf directly
const cpx = require('cpx');

const rollup = require('rollup');
const resolve = require('rollup-plugin-node-resolve');
const postcss = require('rollup-plugin-postcss');
const commonjs = require("rollup-plugin-commonjs");
const alias = require('rollup-plugin-alias');
const uglify = require('rollup-plugin-uglify');
const sourcemaps = require('rollup-plugin-sourcemaps');
const watch = require('gulp-watch');

const bump = require('gulp-bump');
const filter = require('gulp-filter');
const git = require('gulp-git');
const replace = require('gulp-replace');
const tag_version = require('gulp-tag-version');

const dependencies = require("./package.json").dependencies;

//  Util  ---
function sequentialPromise(/*...*/) {
    return new Promise((resolve, reject) => {
        [].push.call(arguments, function (err, data) {
            resolve();
        });
        runSequence.apply(this, arguments);
    });
}

//  Clean  ---
function rmdir(dir) {
    return new Promise(function (resolve, reject) {
        rimraf(dir, function () {
            resolve();
        })
    });
}

gulp.task("clean", [], function () {
    return Promise.all([
        rmdir("dist"),
        rmdir("dist-test"),
        rmdir("lib"),
        rmdir("lib-umd"),
        rmdir("lib-test-*"),
        rmdir("tmp"),
        rmdir("docx"),
        rmdir("coverage"),
        rmdir(".nyc_output")
    ]);
});

//  Copy resources   ---
gulp.task("copy-css", shell.task([
    cpx.copySync("src/**/*.css", "lib/"),
    cpx.copySync("src/**/*.css", "lib-umd/"),
    cpx.copySync("src/**/*.css", "lib-test-es6/src/"),
    cpx.copySync("test/**/*.css", "lib-test-es6/test/")
]));

gulp.task("copy-json", shell.task([
    cpx.copySync("node_modules/@hpcc-js/map/TopoJSON/*.*", "dist/map/TopoJSON/")
]));

//  Compile  ---
gulp.task("compile-src", ["copy-css"], shell.task([
    "tsc -p ./tsconfig.json"
]));

gulp.task("compile-src-watch", shell.task([
    "tsc -w -p ./tsconfig.json"
]));

gulp.task("compile-test-browser", shell.task([
    "tsc -p ./tsconfig-test-browser.json"
]));

gulp.task("compile-test-browser-watch", shell.task([
    "tsc -w -p ./tsconfig-test-browser.json"
]));

gulp.task("compile-test", ["compile-test-browser"]);

gulp.task("compile-all", ["compile-src", "compile-test"]);

//  Docs  ---
gulp.task("docs", shell.task([
    "typedoc --target es6 --ignoreCompilerErrors --out ./docx/ ./src/index-common.ts"
]));

//  Bundle  ---
var cache;
function doRollup(entry, dest, format, min, external, _alias) {
    console.log(dest);
    external = external || [];
    _alias = _alias || {};
    const plugins = [
        alias(_alias),
        resolve({
            jsnext: true,
            main: true
        }),
        postcss({
            plugins: [],
            extensions: ['.css']  // default value
        }),
        commonjs({
            namedExports: {}
        }),
        sourcemaps()
    ];
    const pluginsxxx = [
        alias(_alias),
        resolve({
            jsnext: true,
            main: true
        }),
        commonjs({
            namedExports: {
                "dagre": ["graphlib", "layout"],
                "react": ["Component", "createElement"],
                "react-dom": ["render"],
                "..\\dgrid\\dist\\dgrid.js": ["Memory", "PagingGrid"]
            }
        }),
        sourcemaps()
    ];
    if (min) {
        plugins.push(uglify({}));
    }

    return rollup.rollup({
        entry: entry + ".js",
        external: external,
        cache: cache,
        plugins: plugins
    }).then(function (bundle) {
        cache = bundle;
        return bundle.write({
            format: format,
            moduleName: "HPCCViz",
            dest: dest + (min ? ".min" : "") + ".js",
            sourceMap: true
        });
    });
}

const deps = require("./package.json").dependencies;
const packages = ["@hpcc-js/common", "@hpcc-js/layout", "@hpcc-js/phosphor", "@hpcc-js/api", "@hpcc-js/other", "@hpcc-js/chart", "@hpcc-js/form", "@hpcc-js/c3chart", "@hpcc-js/google", "@hpcc-js/amchart", "@hpcc-js/tree", "@hpcc-js/graph", "@hpcc-js/map", "@hpcc-js/handson", "@hpcc-js/react", "@hpcc-js/composite", "@hpcc-js/marshaller"];  //  Order is important ---
const exclusions = ["amcharts3", "handsontable", "c3", "d3", "dagre", "colorbrewer", "font-awesome", "simpleheat", "d3-cloud",
    "@hpcc-js/phosphor-lib"];

gulp.task("build-amd-src", function () {
    const libLocations = {};
    const libPackages = {};
    packages.forEach(function (pckg) {
        libLocations[pckg] = pckg;
    });
    packages.forEach(function (pckg) {
        const dependencies = require("./node_modules/" + pckg + "/package.json").dependencies;
        libPackages[pckg] = {
            entries: [],
            aliases: {}
        }
        libPackages[pckg + "-vendor"] = {
            isVendor: true,
            entries: [],
            aliases: {}
        }
        for (var key in dependencies) {
            if (exclusions.indexOf(key) < 0) {
                if (libLocations[key]) {
                    libPackages[pckg].aliases[key] = libLocations[key];
                } else {
                    libLocations[key] = pckg + "-vendor";
                    libPackages[pckg + "-vendor"].entries.push(key);
                    libPackages[pckg].aliases[key] = pckg + "-vendor";
                }
            }
        }
    });
    return new Promise(function (resolve, reject) {
        rimraf("tmp", function () {
            resolve();
        });
    }).then(function () {
        fs.mkdirSync("tmp");
        return Promise.all(
            Object.keys(libPackages).map(function (pckg) {
                const libName = pckg.split("/")[1];
                const libPackage = libPackages[pckg];
                var externals = {};
                for (var key in libPackage.aliases) {
                    externals[libLocations[key]] = true;
                }
                if (libPackage.isVendor) {
                    var indexTs = "";
                    libPackage.entries.forEach(function (entry) {
                        indexTs += "export * from \"" + entry + "\";\n";
                    });
                    if (indexTs) {
                        fs.writeFileSync("tmp/" + libName + ".js", indexTs);
                        return doRollup("tmp/" + libName, "dist/" + libName, "amd", false, Object.keys(externals), libPackage.aliases);
                    } else {
                        return Promise.resolve();
                    }
                } else {
                    return doRollup("node_modules/" + pckg + "/lib-es6/index", "dist/" + libName, "amd", false, Object.keys(externals), libPackage.aliases);
                }
            }))
            .then(function (tmp) {
            })
            .catch(function (e) {
                console.log(e.message);
            });
    });
});


gulp.task("bundle-browser", function () {
    return Promise.all([
        //doRollup("lib/index-browser", "dist/viz-browser", "umd", true),
        doRollup("lib/index-browser", "dist/viz-browser", "umd", false)
    ]);
});

gulp.task("bundle-test-browser", function () {
    return Promise.all([
        doRollup("lib-test-es6/test/index", "dist-test/viz-browser", "iife", false, ["chai"])
    ]);
});

gulp.task("bundle-test", ["bundle-test-browser"]);

gulp.task("bundle-all", ["bundle-browser"]);

gulp.task("build", function (cb) {
    return sequentialPromise("clean").then(() => {
        return Promise.all([
            sequentialPromise("compile-src", "bundle-all")//,
            //sequentialPromise("docs")
        ]);
    });
});

//  Watch for browser ---
gulp.task('watch-browser', function () {
    gulp.start("compile-src");
    return watch('lib/**/*.js', function () {
        gulp.start("bundle-browser");
    });
});

gulp.task('watch-test-browser', function () {
    return Promise.all([
        sequentialPromise("compile-src", "bundle-all")//,
        //sequentialPromise("docs")
    ]);

    gulp.start("copy-css");
    gulp.start("compile-test-browser");
    return watch('lib-test-es6/**/*.js', function () {
        console.log("xxx");
        gulp.start("bundle-test-browser");
        console.log("yyy");
    });
});

//  Version Bumping  ---
gulp.task("bump-package", [], function () {
    var args = {};
    if (argv.version) {
        args.version = argv.version;
    } else if (argv.type) {
        args.type = argv.type;
    } else if (argv.major) {
        args.type = "major";
    } else if (argv.minor) {
        args.type = "minor";
    } else {
        args.type = "patch";
    }
    return gulp.src(["./package.json"])
        .pipe(bump(args))
        .pipe(gulp.dest("./"))
        ;
});

gulp.task("bump", ["bump-package"], function () {
    const npmPackage = require('./package.json');
    return gulp.src(["./src/index-common.ts"])
        .pipe(replace(/export const version = "(.*?)";/, "export const version = \"" + npmPackage.version + "\";"))
        .pipe(gulp.dest("./src/"))
        ;
});

//  GIT Tagging  ---
const TAG_FILES = ["./package.json", "./src/index-common.ts", "./dist", "./lib", "./docx"];
gulp.task("git-create-branch", function (cb) {
    var version = require("./package.json").version;
    git.checkout("b" + version, { args: "-b" }, cb);
});

gulp.task("git-add-dist", ["git-create-branch"], function (cb) {
    return gulp.src(TAG_FILES)
        .pipe(git.add({ args: "-f" }))
        ;
});

gulp.task("tag", ["git-add-dist"], function () {
    var version = require("./package.json").version;
    return gulp.src(TAG_FILES)
        .pipe(git.commit("Release " + version + "\n\nTag for release.\nAdd dist files.\n", { args: "-s" }))
        .pipe(filter("package.json"))
        .pipe(tag_version())
        ;
});

gulp.task("tag-release", ["tag"], function (cb) {
    var version = require("./package.json").version;
    var target = argv.upstream ? "upstream" : "origin"
    git.push(target, 'b' + version, function (err) {
        if (err) {
            cb(err);
        } else {
            git.push(target, 'v' + version, function (err) {
                cb(err);
            });
        }
    });
});
//  --- --- ---

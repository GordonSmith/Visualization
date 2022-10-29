import fetch, { Headers, Request, Response } from "node-fetch";
import { promises as fs } from "fs";
import yargsMode from "yargs";
import { compile, download } from "../index";
import { doDownload, doDownloadRecursive, install } from "./download";

if (!globalThis.fetch) {
    (globalThis as any).fetch = fetch;
    (globalThis as any).Headers = Headers;
    (globalThis as any).Request = Request;
    (globalThis as any).Response = Response;
}

async function doCompile(url, filePath) {
    const nb = await download(url);
    const define = await compile(nb, { baseUrl: process.cwd() });
    const js = define.toString();
    if (filePath) {
        fs.writeFile(filePath, js);
    } else {
        console.info(js);
    }
}

const yargs = yargsMode(process.argv.slice(2));
yargs
    .scriptName("ojscc")
    .wrap(Math.min(90, yargs.terminalWidth()))
    .command("install", "Install ObservableHQ Notebook and Dependencies",
        function (yargs) {
            return yargs
                .usage("ojscc install @user/notebook")
                .demandCommand(1, "Notebook ID required")
                ;
        }, function (argv) {
            install(argv._[1]);
        }
    )
    .command("download", "Download ObservableHQ Notebook",
        function (yargs) {
            return yargs
                .usage("ojscc download [-o myfile.ojsnb] [-r] https://observablehq.com/@user/notebook")
                .demandCommand(1, "URL required")
                .option("o", {
                    alias: "output",
                    describe: "Optional output file path"
                })
                .option("r", {
                    alias: "recursive",
                    boolean: true,
                    describe: "Download all dependencies"
                })
                ;
        }, function (argv) {
            argv.r ? doDownloadRecursive(argv._[1], argv.o) : doDownload(argv._[1], argv.o);
        }
    )
    .command("compile", "Compile ObservableHQ Notebook",
        function (yargs) {
            return yargs
                .usage("ojscc compile [-o myfile.js] myfile.ojsnb")
                .demandCommand(1, "URL required")
                .option("o", {
                    alias: "output",
                    describe: "Optional output file path"
                })
                ;
        },
        async function (argv) {
            doCompile(argv._[1], argv.o);
        }
    )
    .help("h")
    .alias("h", "help")
    .epilog("https://github.com/hpcc-systems/Visualization/tree/trunk/packages/observablehq-compiler")
    ;

yargs.argv;

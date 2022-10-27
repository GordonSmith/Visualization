import fetch, { Headers, Request, Response } from 'node-fetch';
import { promises } from 'fs';
import yargsMode from 'yargs';
import { downloadRecursive, download, compile } from '../dist/index.js';

if (!globalThis.fetch) {
    globalThis.fetch = fetch;
    globalThis.Headers = Headers;
    globalThis.Request = Request;
    globalThis.Response = Response;
}
async function doDownload(url, filePath, recursive) {
    const nb = recursive ? await downloadRecursive(url) : await download(url);
    if (filePath) {
        promises.writeFile(filePath, JSON.stringify(nb, undefined, 4));
    }
    else {
        console.info(nb);
    }
}
async function doCompile(url, filePath) {
    const nb = await download(url);
    const define = await compile(nb, { baseUrl: process.cwd() });
    const js = define.toString();
    if (filePath) {
        promises.writeFile(filePath, js);
    }
    else {
        console.info(js);
    }
}
const yargs = yargsMode(process.argv.slice(2));
yargs
    .scriptName("ojscc")
    .wrap(Math.min(90, yargs.terminalWidth()))
    .command("download", "Download ObservableHQ Notebook", function (yargs) {
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
    });
}, function (argv) {
    doDownload(argv._[1], argv.o, argv.r);
})
    .command("compile", "Compile ObservableHQ Notebook", function (yargs) {
    return yargs
        .usage("ojscc compile [-o myfile.js] myfile.ojsnb")
        .demandCommand(1, "URL required")
        .option("o", {
        alias: "output",
        describe: "Optional output file path"
    });
}, async function (argv) {
    doCompile(argv._[1], argv.o);
})
    .help("h")
    .alias("h", "help")
    .epilog("https://github.com/hpcc-systems/Visualization/tree/trunk/packages/observablehq-compiler");
yargs.argv;
//# sourceMappingURL=ojscc.mjs.map

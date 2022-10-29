import fetch, { Headers, Request, Response } from 'node-fetch';
import { promises } from 'fs';
import yargsMode from 'yargs';
import { download, downloadRecursive, compile } from '../dist/index.js';
import fs from 'fs/promises';
import path from 'path';

async function writeNotbook(filePath, notebook) {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    fs.writeFile(filePath, JSON.stringify(notebook, undefined, 4));
}
async function doDownload(url, filePath) {
    const nb = await download(url);
    if (filePath) {
        writeNotbook(filePath, nb);
    }
    else {
        console.info(nb);
    }
}
async function doDownloadRecursive(url, filePath) {
    const all = await downloadRecursive(url);
    if (filePath) {
        writeNotbook(filePath, all.notebook);
        const depsFolder = path.join(path.dirname(filePath), path.basename(filePath, path.extname(filePath)));
        for (const key in all.dependencies) {
            writeNotbook(path.join(depsFolder, key) + ".ojsnb", all.dependencies[key]);
        }
    }
    else {
        console.info(all);
    }
}
async function install(url) {
    const all = await downloadRecursive(url);
    for (const key in all) {
        writeNotbook(path.join(process.cwd(), "ojs_modules", key) + ".ojsnb", all[key]);
    }
}

if (!globalThis.fetch) {
    globalThis.fetch = fetch;
    globalThis.Headers = Headers;
    globalThis.Request = Request;
    globalThis.Response = Response;
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
    .command("install", "Install ObservableHQ Notebook and Dependencies", function (yargs) {
    return yargs
        .usage("ojscc install @user/notebook")
        .demandCommand(1, "Notebook ID required");
}, function (argv) {
    install(argv._[1]);
})
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
    argv.r ? doDownloadRecursive(argv._[1], argv.o) : doDownload(argv._[1], argv.o);
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

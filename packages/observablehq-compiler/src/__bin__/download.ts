import fs from "fs/promises";
import path from "path";
import { download, downloadRecursive, ohq } from "../index";

async function writeNotbook(filePath: string, notebook: ohq.Notebook) {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    fs.writeFile(filePath, JSON.stringify(notebook, undefined, 4));
}

export async function doDownload(url, filePath) {
    const nb = await download(url);
    if (filePath) {
        writeNotbook(filePath, nb);
    } else {
        console.info(nb);
    }
}

export async function doDownloadRecursive(url, filePath) {
    const all = await downloadRecursive(url);
    if (filePath) {
        writeNotbook(filePath, all.notebook);
        const depsFolder = path.join(path.dirname(filePath), path.basename(filePath, path.extname(filePath)));
        for (const key in all.dependencies) {
            writeNotbook(path.join(depsFolder, key) + ".ojsnb", all.dependencies[key]);
        }
    } else {
        console.info(all);
    }
}

export async function install(url: string) {
    const all = await downloadRecursive(url);
    for (const key in all) {
        writeNotbook(path.join(process.cwd(), "ojs_modules", key) + ".ojsnb", all[key]);
    }
}

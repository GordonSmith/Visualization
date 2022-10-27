import type { ohq } from "@hpcc-js/observable-shim";
import { parseCell } from "./cst";
import { fetchEx } from "./util";

function downloadNotebook(partialUrl: string): Promise<ohq.Notebook> {
    return fetchEx(`https://api.observablehq.com/document/${partialUrl}`)
        .then(r => r.json())
        ;
}

function full2partial(fullUrl: string) {
    const isShared = fullUrl.indexOf("https://observablehq.com/d") === 0;
    return fullUrl.replace(`https://observablehq.com/${isShared ? "d/" : ""}`, "");
}

type PartialUrl = string;
export type Notebooks = { [partialUrl: PartialUrl]: ohq.Notebook };

async function gatherNotebooks(partialUrl: PartialUrl, notebooks: Notebooks): Promise<void> {
    if (notebooks[partialUrl]) {
        return Promise.resolve();
    }
    const notebook = await downloadNotebook(partialUrl);
    notebooks[partialUrl] = notebook;

    const promises = [];
    notebook.files.forEach(file => {
        try {
        } catch (e) { }
    });
    notebook.nodes.filter(cell => cell.mode === "js").forEach(cell => {
        try {
            const cst = parseCell(cell.value);
            if (cst.type === "import") {
                promises.push(gatherNotebooks(cst.src, notebooks));
            }
        } catch (e) { }
    });
    return Promise.all(promises).then(_ => { });
}

export function download(fullUrl: string): Promise<ohq.Notebook> {
    return downloadNotebook(full2partial(fullUrl));
}

export async function downloadRecursive(fullUrl: string): Promise<Notebooks> {
    const partialUrl = full2partial(fullUrl);
    const retVal: Notebooks = {};
    await gatherNotebooks(partialUrl, retVal);
    return retVal;
}

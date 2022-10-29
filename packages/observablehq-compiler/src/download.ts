import type { ohq } from "@hpcc-js/observable-shim";
import { parseCell } from "./cst";
import { fetchEx } from "./util";

function downloadNotebook(partialUrl: string): Promise<ohq.Notebook> {
    return fetchEx(`https://api.observablehq.com/document/${partialUrl}`)
        .then(r => r.json())
        ;
}

function notebookId(fullOrPartialUrl: string) {
    const isFullUrl = fullOrPartialUrl.indexOf("https://observablehq.com") === 0;
    if (isFullUrl) {
        const isShared = fullOrPartialUrl.indexOf("https://observablehq.com/d") === 0;
        return fullOrPartialUrl.replace(`https://observablehq.com/${isShared ? "d/" : ""}`, "");
    }
    return fullOrPartialUrl;
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

export function download(fullOrPartialUrl: string): Promise<ohq.Notebook> {
    const partialUrl = notebookId(fullOrPartialUrl);
    return downloadNotebook(partialUrl);
}

export async function fetchRecursive(fullOrPartialUrl: string): Promise<Notebooks> {
    const partialUrl = notebookId(fullOrPartialUrl);
    const dependencies: Notebooks = {};
    await gatherNotebooks(partialUrl, dependencies);
    return dependencies;
}

export async function downloadRecursive(fullOrPartialUrl: string): Promise<{ notebook: ohq.Notebook, dependencies: Notebooks }> {
    const partialUrl = notebookId(fullOrPartialUrl);
    const dependencies = await fetchRecursive(partialUrl);
    const notebook = dependencies[partialUrl];
    delete dependencies[partialUrl];
    return { notebook, dependencies };
}

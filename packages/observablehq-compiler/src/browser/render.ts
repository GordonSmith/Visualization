import type { ohq } from "@hpcc-js/observable-shim/dist/parser";
import { Notebook } from "../browser/notebook";
import { createHookedObserverFactory, HookedObserver, nullObserver } from "../browser/observer";
import { ojs2ohqnb, omd2ojs } from "../node/util";

export function renderOJS(ojs: string, element: HTMLElement, ext?: { callback?: ohq.Inspector, folder?: string }) {
    const notebook = new Notebook()
        .observerFactory(name => {
            const div = document.createElement("div");
            element.appendChild(div);
            return new HookedObserver(div, ext?.callback ?? nullObserver);
        })
        ;
    if (ext?.folder) {
        notebook.baseUrl(ext.folder);
    }
    notebook.ohqNotebook(ojs2ohqnb(ojs));
    notebook.interpret();
    return notebook;
}

export function renderOMD(omd: string, element: HTMLElement, ext?: { callback?: ohq.Inspector, folder?: string }) {
    const ojsArr = omd2ojs(omd);
    return renderOJS(ojsArr.map(row => row.ojs).join("\n"), element, ext);
}

export function renderOJSNB(ojsnb: string, element: HTMLElement, ext?: { callback?: ohq.Inspector, folder?: string }) {
    const parsed: ohq.Notebook = JSON.parse(ojsnb);
    const notebook = new Notebook()
        .ohqNotebook(parsed)
        .observerFactory(createHookedObserverFactory(element, ext?.callback))
        ;
    if (ext?.folder) {
        notebook.baseUrl(ext.folder);
    }
    notebook.interpret();
    return notebook;
}

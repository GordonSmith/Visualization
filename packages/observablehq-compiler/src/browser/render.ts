import { Notebook } from "../notebook";
import { createHookedObserverFactory, HookedObserver, nullObserver } from "../observer";
import { omd2ojs } from "../util";
import { observablehq } from "../types";

export function renderOJS(ojs: string, element: HTMLElement, ext?: { callback?: observablehq.Inspector, folder?: string }) {
    const notebook = new Notebook()
        .observerFactory(name => {
            const div = document.createElement("div");
            element.appendChild(div);
            return new HookedObserver(div, ext?.callback ?? nullObserver);
        })
        ;
    if (ext?.folder) {
        notebook.folder(ext.folder);
    }
    notebook.parseOJS(ojs);
    return notebook;
}

export function renderOMD(omd: string, element: HTMLElement, ext?: { callback?: observablehq.Inspector, folder?: string }) {
    const ojsArr = omd2ojs(omd);
    return renderOJS(ojsArr.map(row => row.ojs).join("\n"), element, ext);
}

export function renderOJSNB(ojsnb: string, element: HTMLElement, ext?: { callback?: observablehq.Inspector, folder?: string }) {
    const parsed: observablehq.Notebook = JSON.parse(ojsnb);
    const notebook = new Notebook()
        .notebook(parsed)
        .observerFactory(createHookedObserverFactory(element, ext?.callback))
        ;
    if (ext?.folder) {
        notebook.folder(ext.folder);
    }
    notebook.interpret();
    return notebook;
}

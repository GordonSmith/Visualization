import type { ohq } from "@hpcc-js/observable-shim";
import { Runtime, Library, FileAttachments } from "@hpcc-js/observable-shim";
import { endsWith, join } from "@hpcc-js/util";
import { Node } from "./node";
import { NotebookData } from "./notebookData";
import { nullObserverFactory } from "./observer";
import { ojs2ohqnb, omd2ohqnb } from "./util";
import { Writer } from "./writer";

async function fetchUrl(url) {
    return fetch(url).then(r => r.text());
}

export class Notebook {

    protected _runtime: ohq.Runtime;
    protected _main: ohq.Module;
    protected _cells: Map<ohq.Node, Node> = new Map<ohq.Node, Node>();

    protected _notebookdata = new NotebookData();
    ohqNotebook(): ohq.Notebook;
    ohqNotebook(_: ohq.Notebook): this;
    ohqNotebook(_?: ohq.Notebook): ohq.Notebook | this {
        if (arguments.length === 0) return this._notebookdata.serialize();
        this._notebookdata.deserialize(_);
        this.disposeCells();
        this._notebookdata.nodes().forEach((cell, idx) => {
            this.attachCell(cell, this._observerFactory);
        });
        return this;
    }

    protected _observerFactory: ohq.InspectorFactory = nullObserverFactory;
    observerFactory(): ohq.InspectorFactory;
    observerFactory(_: ohq.InspectorFactory): this;
    observerFactory(_?: ohq.InspectorFactory): ohq.InspectorFactory | this {
        if (arguments.length === 0) return this._observerFactory;
        this._observerFactory = _;
        return this;
    }

    protected _baseUrl: string = ".";
    baseUrl(): string;
    baseUrl(_: string): this;
    baseUrl(_?: string): string | this {
        if (arguments.length === 0) return this._baseUrl;
        this._baseUrl = _;
        return this;
    }

    constructor(plugins: object = {}, runtime?: ohq.Runtime) {

        const library = new Library();
        const context = this;
        library.FileAttachment = function () {
            return FileAttachments(name => {
                return context._notebookdata.fileUrl(name) ?? name;
            });
        };

        const domDownload = library.DOM.download;
        library.DOM.download = function (blob, file) {
            return domDownload(blob, context._notebookdata.fileUrl(file) ?? file);
        };

        this._runtime = runtime ?? new Runtime({ ...library, ...plugins });
        this._main = this._runtime.module();
    }

    dispose() {
        this.disposeCells();
        this._runtime.dispose();
    }

    async importFile(partial: string) {
        const path = join(this.baseUrl(), partial);
        const content = await fetchUrl(path);
        let ohqnb: ohq.Notebook;
        if (endsWith(partial, ".ojsnb")) {
            ohqnb = JSON.parse(content);
        } else if (endsWith(partial, ".ojs")) {
            ohqnb = ojs2ohqnb(content);
        } else if (endsWith(partial, ".omd")) {
            ohqnb = omd2ohqnb(content);
        }

        const notebook = new Notebook(undefined, this._runtime);
        notebook.baseUrl(this.baseUrl());
        notebook.ohqNotebook(ohqnb);

        await notebook.interpret();
        return notebook._main;
    }

    private attachCell(node: ohq.Node, observer?: ohq.InspectorFactory): Node {
        const newCell = new Node(this, node, observer);
        this._cells.set(node, newCell);
        return newCell;
    }

    createCell(observer?: ohq.InspectorFactory): Node {
        const node = this._notebookdata.appendNode();
        const newCell = new Node(this, node, observer);
        this._cells.set(node, newCell);
        return newCell;
    }

    destroyCell(cell: Node) {
        cell.reset();
        this._cells.delete(cell._node);
        this._notebookdata.removeNode(cell._node);
    }

    private disposeCells() {
        [...this._cells.values()].forEach(cell => this.destroyCell(cell));
    }

    async interpret() {
        this._cells.forEach(async cell => await cell.interpret());
    }

    compile(writer: Writer) {
        this._cells.forEach(cell => {
            try {
                cell.compile(writer);
            } catch (e: any) {
                writer.error(e?.message);
            }
        });
    }

    //  ObservableHQ  ---
    main(): ohq.Module {
        return this._main;
    }

    createModule(define): ohq.Module {
        return this._runtime.module(define);
    }

    createVariable(inspector?: ohq.Inspector, name?: string, inputs?: string[], definition?: any): ohq.Variable {
        const retVal = this._main.variable(inspector);
        if (arguments.length > 1) {
            try {
                retVal.define(name, inputs, definition);
            } catch (e: any) {
                console.error(e?.message);
            }
        }
        return retVal;
    }

    importVariable(name: string, alias: string | undefined, otherModule: ohq.Module): ohq.Variable {
        return this._main.import(name, alias, otherModule);
    }
}

// export function deserialize(notebook?: ohq.Notebook): Notebook {

// }

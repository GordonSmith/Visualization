import { Runtime, Library, FileAttachments, parseModule } from "@hpcc-js/observable-shim";
import { endsWith, join } from "@hpcc-js/util";
import { Cell } from "./cell";
import { nullObserverFactory } from "./observer";
import { observablehq as ohq } from "./types";
import { ojsnb2ojs, omd2ojs } from "./util";
import { Writer } from "./writer";

function createEmptyNotebook(): ohq.Notebook {
    return {
        files: [],
        nodes: []
    } as ohq.Notebook;
}

export class Notebook {

    protected _runtime: ohq.Runtime;
    protected _main: ohq.Module;
    protected _cells: Set<Cell> = new Set<Cell>();

    protected _notebook: ohq.Notebook = createEmptyNotebook();
    notebook(): ohq.Notebook;
    notebook(_: ohq.Notebook): this;
    notebook(_?: ohq.Notebook): ohq.Notebook | this {
        if (arguments.length === 0) return this._notebook;
        this._notebook = _;
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

    protected _folder: string = ".";
    folder(): string;
    folder(_: string): this;
    folder(_?: string): string | this {
        if (arguments.length === 0) return this._folder;
        this._folder = _;
        return this;
    }

    constructor(plugins: object = {}, runtime?: ohq.Runtime) {
        const files = {};
        this._notebook?.files?.forEach(f => files[f.name] = f.url);

        const library = new Library();
        library.FileAttachment = function () {
            return FileAttachments(name => {
                return files[name] ?? name;
            });
        };

        const domDownload = library.DOM.download;
        library.DOM.download = function (blob, file) {
            return domDownload(blob, files[file]);
        };

        this._runtime = runtime ?? new Runtime({ ...library, ...plugins });
        this._main = this._runtime.module();
    }

    dispose() {
        this._runtime.dispose();
        this._cells.clear();
    }

    protected async fetchUrl(url) {
        return fetch(url).then(r => r.text());
    }

    async importFile(partial: string) {
        const path = join(this.folder(), partial);
        let ojs = await this.fetchUrl(path);
        if (endsWith(partial, ".omd")) {
            ojs = omd2ojs(ojs).map(row => row.ojs).join("\n");
        } else if (endsWith(partial, ".ojsnb")) {
            ojs = ojsnb2ojs(ojs).map(row => row.ojs).join("\n");
        }

        const notebook = new Notebook(undefined, this._runtime);
        notebook.folder(this.folder());
        await notebook.parseOJS(ojs);
        return notebook._main;
    }

    async parseOJS(ojs: string) {
        const parsed = parseModule(ojs);
        parsed.cells.forEach((cell, idx) => {
            this.createCell(this._observerFactory).text(ojs.substring(cell.start, cell.end), "ojs");
        });
        await this.interpret();
    }

    createCell(observer?: ohq.InspectorFactory): Cell {
        const newCell = new Cell(this, observer);
        this._cells.add(newCell);
        return newCell;
    }

    disposeCell(cell: Cell) {
        cell.reset();
        this._cells.delete(cell);
    }

    async interpret() {
        this._cells.forEach(async cell => await cell.evaluate());
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

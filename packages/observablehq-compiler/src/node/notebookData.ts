import type { ohq } from "@hpcc-js/observable-shim/dist/parser";

export class NotebookData {

    protected _ohqNotbook: ohq.Notebook;
    protected _files = new Map<string, ohq.File>();
    protected _nodes = new Map<number, ohq.Node>();

    constructor(_?: ohq.Notebook) {
        this._ohqNotbook = _ ?? {
            files: [],
            nodes: []
        } as ohq.Notebook;
    }

    protected sync() {
        this._files.clear();
        this._ohqNotbook?.files?.forEach(f => this._files.set(f.name, f));
        this._nodes.clear();
        this._ohqNotbook?.nodes?.forEach(n => this._nodes.set(n.id, n));
        return this;
    }

    serialize(): ohq.Notebook {
        return {
            ...this._ohqNotbook,
            files: [...this._files.values()],
            nodes: [...this._nodes.values()],
        } as ohq.Notebook;
    }

    deserialize(_: ohq.Notebook): this {
        this._ohqNotbook = _;
        this.sync();
        return this;
    }

    fileUrl(name: string): string {
        return this._files.get(name).url;
    }

    appendNode() {
        let id = 0;
        while (!this._nodes.has(id)) {
            ++id;
        }
        const retVal = {
            id,
            mode: "js",
            name: "",
            value: ""
        };
        this._nodes.set(id, retVal);
        return retVal;
    }

    removeNode(node: ohq.Node) {
        this._nodes.delete(node.id);
    }

    nodes(): ReadonlyArray<ohq.Node> {
        return [...this._nodes.values()];
    }
}


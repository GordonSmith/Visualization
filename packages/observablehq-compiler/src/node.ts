import type { ohq } from "@hpcc-js/observable-shim";
import { Notebook } from "./notebook";
import { parseCell } from "./parser";
import { obfuscatedImport } from "./util";
import { Writer } from "./writer";
import { nullObserverFactory } from "./observer";

export type Mode = "md" | "js";

export class Node {

    protected _notebook: Notebook;
    readonly _node: ohq.Node;
    protected _observer: ohq.InspectorFactory;
    protected _variables = new Set<ohq.Variable>();

    constructor(notebook: Notebook, node: ohq.Node, observer: ohq.InspectorFactory = nullObserverFactory) {
        this._notebook = notebook;
        this._node = node;
        this._observer = observer;
    }

    reset() {
        this._variables?.forEach(v => v.delete());
        this._variables.clear();
    }

    dispose() {
        this._notebook.destroyCell(this);
    }

    protected async importNotebook(partial) {
        const impMod = await obfuscatedImport(`https://api.observablehq.com/${partial[0] === "@" ? partial : `d/${partial}`}.js?v=3`);
        return this._notebook.createModule(impMod.default);
    }

    mode(): Mode;
    mode(_: Mode): this;
    mode(_?: Mode): Mode | this {
        if (arguments.length === 0) return this._node.mode as Mode;
        this._node.mode = _;
        return this;
    }

    value(): string;
    value(_: string): this;
    value(_?: string): string | this {
        if (arguments.length === 0) return this._node.value;
        this._node.value = _;
        return this;
    }

    async interpret() {
        this.reset();

        const parsed = parseCell(this.value());
        switch (parsed.type) {
            case "import":
                let mod = [".", "/"].indexOf(parsed.src[0]) === 0 ?
                    await this._notebook.importFile(parsed.src) :
                    await this.importNotebook(parsed.src);

                if (parsed.injections.length) {
                    mod = mod.derive(parsed.injections, this._notebook.main());
                }

                parsed.specifiers.forEach(spec => {
                    const viewof = spec.view ? "viewof " : "";
                    this._variables.add(this._notebook.importVariable(viewof + spec.name, viewof + spec.alias, mod));
                    if (spec.view) {
                        this._variables.add(this._notebook.importVariable(spec.name, spec.alias, mod));
                    }
                });
                this._variables.add(this._notebook.createVariable(this._observer(), undefined, ["md"], md => {
                    return md`\`\`\`JavaScript
${this.value()}
\`\`\``;
                }));
                break;
            case "viewof":
                this._variables.add(this._notebook.createVariable(this._observer(parsed.variable.id), parsed.variable.id, parsed.variable.inputs, parsed.variable.func));
                this._variables.add(this._notebook.createVariable(undefined, parsed.variableValue.id, parsed.variableValue.inputs, parsed.variableValue.func));
                break;
            case "mutable":
                this._variables.add(this._notebook.createVariable(undefined, parsed.initial.id, parsed.initial.inputs, parsed.initial.func));
                this._variables.add(this._notebook.createVariable(undefined, parsed.variable.id, parsed.variable.inputs, parsed.variable.func));
                this._variables.add(this._notebook.createVariable(this._observer(parsed.variableValue.id), parsed.variableValue.id, parsed.variableValue.inputs, parsed.variableValue.func));
                break;
            case "variable":
                this._variables.add(this._notebook.createVariable(this._observer(parsed.id), parsed.id, parsed.inputs, parsed.func));
                break;
        }
    }

    compile(writer: Writer) {
        const parsed = parseCell(this.value());
        let id;
        switch (parsed.type) {
            case "import":
                writer.import(parsed);
                break;
            case "viewof":
                id = writer.function(parsed.variable);
                writer.define(parsed.variable, true, false, id);
                writer.define(parsed.variableValue, false, true);
                break;
            case "mutable":
                id = writer.function(parsed.initial);
                writer.define(parsed.initial, false, false, id);
                writer.define(parsed.variable, false, true);
                writer.define(parsed.variableValue, true, true);
                break;
            case "variable":
                id = writer.function(parsed);
                writer.define(parsed, true, false, id);
                break;
        }
    }
}

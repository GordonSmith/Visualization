import { observablehq as ohq } from "./types";
import { Notebook } from "./notebook";
import { parseCell } from "./parser";
import { encodeBacktick, obfuscatedImport } from "./util";
import { Writer } from "./writer";
import { nullObserverFactory } from "./observer";

export class Cell {

    protected _notebook: Notebook;
    protected _id: string | number;
    protected _observer: ohq.InspectorFactory;
    protected _variables = new Set<ohq.Variable>();

    constructor(notebook: Notebook, observer: ohq.InspectorFactory = nullObserverFactory) {
        this._notebook = notebook;
        this._observer = observer;
    }

    reset() {
        this._variables?.forEach(v => v.delete());
        this._variables.clear();
    }

    dispose() {
        this._notebook.disposeCell(this);
    }

    protected async importNotebook(partial) {
        const impMod = await obfuscatedImport(`https://api.observablehq.com/${partial[0] === "@" ? partial : `d/${partial}`}.js?v=3`);
        return impMod.define;
    }

    protected _cellSource: string = "";
    text(): string;
    text(cellSource: string, languageId?: string): this;
    text(cellSource?: string, languageId: string = "ojs"): string | this {
        if (arguments.length === 0) return this._cellSource;
        if (languageId === "markdown") {
            languageId = "md";
        }
        this._cellSource = languageId === "ojs" ? cellSource! : `${languageId}\`${encodeBacktick(cellSource!)}\``;
        return this;
    }

    async evaluate() {
        this.reset();

        const parsed = parseCell(this._cellSource);
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
${this._cellSource}
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
        const parsed = parseCell(this._cellSource);
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

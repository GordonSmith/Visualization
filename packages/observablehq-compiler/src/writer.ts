import { ohq } from "@hpcc-js/observable-shim";
import { ParsedImportCell, ParsedVariable } from "./cst";

export class Writer {

    protected _inFile: string;
    protected _outFile: string;
    protected _files: ohq.File[] = [];
    protected _imports: string[] = [];
    protected _importNodes: ohq.Node[] = [];
    protected _functions: string[] = [];
    protected _functionNodes: ohq.Node[] = [];
    protected _defines: string[] = [];
    protected _defineUid = 0;
    protected _functionUid = 0;

    constructor(notebook: ohq.Notebook, inFile: string = "tmp.ojs", outFile: string = "tmp.js") {
        this._inFile = inFile;
        this._outFile = outFile;
    }

    toString() {
        return `\
${this._imports.join("\n")}

${this._functions.join("\n").split("\n) {").join("){")}

export default function define(runtime, observer) {
  const main = runtime.module();

  function toString() { return this.url; }
  const fileAttachments = new Map([
    ${this._files.map(f => `["${f.name}", { url: new URL("${f.url}"), mimeType: ${JSON.stringify(f.mime_type)}, toString }]`).join(",\n    ")}
  ]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));

  ${this._defines.join("\n  ")}

  return main;
}
//# sourceMappingURL=${this._outFile}.map
`;
    }

    toMap() {
        const mappings = {};
        let functionPos = 0;
        this._importNodes.forEach((node, idx) => {
            mappings[idx + 1] = node;
            ++functionPos;
        });
        ++functionPos;
        this._functionNodes.forEach((node, idx) => {
            const func = this._functions[idx].split("\n) {").join("){").split("\n");
            for (let idx2 = 0; idx2 < func.length; ++idx2) {
                mappings[functionPos] = node;
                ++functionPos;
            }
        });

        return {
            version: 3,
            file: "${this._outFile}",
            sources: ["${this._inFile}"],
            names: [],
            mappings
        };
    }

    files(files: ohq.File[]) {
        this._files = [...this._files, ...files];
    }

    import(url: string, node: ohq.Node) {
        this._imports.push(`import define${++this._defineUid} from "${url}"; `);
        this._importNodes.push(node);
    }

    importDefine(imp: Partial<ParsedImportCell>) {
        const injections = imp.injections.map(inj => {
            return inj.name === inj.alias ?
                `"${inj.name}"` :
                `{name: "${inj.name}", alias: "${inj.alias}"}`;
        });
        const derive = imp.injections.length ? `.derive([${injections.join(", ")}], main)` : "";
        this._defines.push(`const child${this._defineUid} = runtime.module(define${this._defineUid})${derive};`);
        imp.specifiers.forEach(s => {
            this._defines.push(`main.import("${s.name}"${s.alias && s.alias !== s.name ? `, "${s.alias}"` : ""}, child${this._defineUid}); `);
        });
    }

    function(variable: Partial<ParsedVariable>, node: ohq.Node) {
        let id = variable.id ?? `${++this._functionUid}`;
        const idParts = id.split(" ");
        id = `_${idParts[idParts.length - 1]}`;
        this._functions.push(`${variable.func?.toString()?.replace("anonymous", `${id}`)}`);
        this._functionNodes.push(node);
        return id;
    }

    define(variable: Partial<ParsedVariable>, observable = true, inlineFunc = false, funcId?: string) {
        funcId = funcId ?? variable.id;
        const observe = observable ? `.variable(observer(${variable.id ? JSON.stringify(variable.id) : ""}))` : "";
        const id = variable.id ? `${JSON.stringify(variable.id)}, ` : "";
        const inputs = variable.inputs.length ? `[${variable.inputs.map(i => JSON.stringify(i)).join(", ")}], ` : "";
        const func = inlineFunc ?
            variable.func?.toString() :
            funcId;
        this._defines.push(`main${observe}.define(${id}${inputs}${func});`);
    }

    error(msg: string) {
    }
}


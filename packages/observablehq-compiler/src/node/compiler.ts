import type { ohq } from "@hpcc-js/observable-shim/dist/parser";
import { endsWith, join } from "@hpcc-js/util";
import { parseCell, ParsedImportCell } from "./parser";
import { fetchUrl, obfuscatedImport, ojs2ohqnb, omd2ohqnb } from "./util";

export async function importFile(relativePath: string, baseUrl: string) {
    const path = join(baseUrl, relativePath);
    const content = await fetchUrl(path);
    let ohqnb: ohq.Notebook;
    if (endsWith(relativePath, ".ojsnb")) {
        ohqnb = JSON.parse(content);
    } else if (endsWith(relativePath, ".ojs")) {
        ohqnb = ojs2ohqnb(content);
    } else if (endsWith(relativePath, ".omd")) {
        ohqnb = omd2ohqnb(content);
    }
    return compile(ohqnb, baseUrl);
}

async function importCompiledNotebook(partial) {
    const impMod = await obfuscatedImport(`https://api.observablehq.com/${partial[0] === "@" ? partial : `d/${partial}`}.js?v=3`);
    return impMod.default;
}

async function createImport(parsed: ParsedImportCell, text: string, baseUrl: string) {
    let mod = [".", "/"].indexOf(parsed.src[0]) === 0 ?
        await importFile(parsed.src, baseUrl) :
        await importCompiledNotebook(parsed.src);

    return (main: ohq.Module, inspector?: ohq.InspectorFactory) => {

        if (parsed.injections.length) {
            mod = mod.derive(parsed.injections, main);
        }

        parsed.specifiers.forEach(spec => {
            const viewof = spec.view ? "viewof " : "";
            main.import(viewof + spec.name, viewof + spec.alias, mod);
            if (spec.view) {
                main.import(spec.name, spec.alias, mod);
            }
        });
        createVariable(true, undefined, ["md"], md => {
            return md`\`\`\`JavaScript
${text}
\`\`\``;
        })(main, inspector);
    };
}

function createVariable(inspect: boolean, name?: string, inputs?: string[], definition?: any) {

    return (module: ohq.Module, inspector?: ohq.InspectorFactory) => {
        const retVal = module.variable(inspect ? inspector(name) : undefined);
        if (arguments.length > 1) {
            try {
                retVal.define(name, inputs, definition);
            } catch (e: any) {
                console.error(e?.message);
            }
        }
        return retVal;
    };
}

async function compileCell(text: string, baseUrl: string) {
    const imports = [];
    const variables = [];
    const parsed = parseCell(text);
    switch (parsed.type) {
        case "import":
            imports.push(await createImport(parsed, text, baseUrl));
            break;
        case "viewof":
            variables.push(createVariable(true, parsed.variable.id, parsed.variable.inputs, parsed.variable.func));
            variables.push(createVariable(false, parsed.variableValue.id, parsed.variableValue.inputs, parsed.variableValue.func));
            break;
        case "mutable":
            variables.push(createVariable(false, parsed.initial.id, parsed.initial.inputs, parsed.initial.func));
            variables.push(createVariable(false, parsed.variable.id, parsed.variable.inputs, parsed.variable.func));
            variables.push(createVariable(true, parsed.variableValue.id, parsed.variableValue.inputs, parsed.variableValue.func));
            break;
        case "variable":
            variables.push(createVariable(true, parsed.id, parsed.inputs, parsed.func));
            break;
    }
    return { imports, variables };
}

export async function compile(ohqnb: ohq.Notebook, baseUrl: string = ".") {
    const cells = await Promise.all(ohqnb.nodes.map(n => compileCell(n.value, baseUrl)));

    return (runtime: ohq.Runtime, inspector?: ohq.InspectorFactory): ohq.Module => {
        const main = runtime.module();
        cells.forEach(({ imports, variables }) => {
            imports.forEach(imp => {
                imp(main, inspector);
            });
            variables.forEach(v => {
                v(main, inspector);
            });
        });
        return main;
    };
}

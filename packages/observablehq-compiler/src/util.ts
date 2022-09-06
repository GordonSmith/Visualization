import { observablehq } from "./types";

const FuncTypes = {
    functionType: Object.getPrototypeOf(function () { }).constructor,
    asyncFunctionType: Object.getPrototypeOf(async function () { }).constructor,
    generatorFunctionType: Object.getPrototypeOf(function* () { }).constructor,
    asyncGeneratorFunctionType: Object.getPrototypeOf(async function* () { }).constructor
};

function funcType(async: boolean = false, generator: boolean = false) {
    if (!async && !generator) return FuncTypes.functionType;
    if (async && !generator) return FuncTypes.asyncFunctionType;
    if (!async && generator) return FuncTypes.generatorFunctionType;
    return FuncTypes.asyncGeneratorFunctionType;
}

interface Ref {
    start: number,
    end: number,
    newText: string
}

export interface Refs {
    inputs: string[];
    args: string[];
    patches: Ref[];
}

export function createFunction(refs: Refs, async = false, generator = false, blockStatement = false, body?: string) {
    if (body === undefined) {
        return undefined;
    }

    refs.patches.sort((l, r) => r.start - l.start);
    refs.patches.forEach(r => {
        body = body!.substring(0, r.start) + r.newText + body!.substring(r.end);
    });
    return new (funcType(async, generator))(...refs.args, blockStatement ?
        body.substring(1, body.length - 1).trim() :
        `return (\n${body}\n);`);
}

//  Hide "import" from bundlers as they have a habit of replacing "import" with "require"
export async function obfuscatedImport(url: string) {
    return new FuncTypes.asyncFunctionType("url", "return import(url)")(url);
}

export interface ParsedOJS {
    ojs: string;
    offset: number;
    inlineMD: boolean;
}

export function encodeBacktick(str: string) {
    return str
        .split("`").join("\\`")
        ;
}

function createParsedOJS(ojs: string, offset: number, inlineMD: boolean): ParsedOJS {
    return {
        ojs,
        offset,
        inlineMD
    };
}

export function omd2ojs(_: string): ParsedOJS[] {
    const retVal: ParsedOJS[] = [];
    //  Load Markdown  ---
    const re = /(```(?:\s|\S)[\s\S]*?```)/g;
    let prevOffset = 0;
    let match = re.exec(_);
    while (match !== null) {
        if (match.index > prevOffset) {
            retVal.push(createParsedOJS("md`" + encodeBacktick(_.substring(prevOffset, match.index)) + "`", prevOffset, true));
        }

        const outer = match[0];
        if (outer.indexOf("``` ") === 0 || outer.indexOf("```\n") === 0 || outer.indexOf("```\r\n") === 0) {
            const prefixLen = 3;
            const inner = outer.substring(prefixLen, outer.length - prefixLen);
            retVal.push(createParsedOJS(inner, match.index + prefixLen, false));
        } else {
            retVal.push(createParsedOJS("md`\\n" + encodeBacktick(outer) + "\\n`", match.index, true));
        }

        prevOffset = match.index + match[0].length;
        match = re.exec(_);
    }
    if (_.length > prevOffset) {
        retVal.push(createParsedOJS("md`\\n" + encodeBacktick(_.substring(prevOffset, _.length)) + "\\n`", prevOffset, true));
    }
    return retVal;
}

export function ojsnb2ojs(_: string): ParsedOJS[] {
    const parsed: observablehq.Notebook = JSON.parse(_);
    return parsed.nodes.map(node => createParsedOJS(node.value, 0, node.mode === "md"));
}

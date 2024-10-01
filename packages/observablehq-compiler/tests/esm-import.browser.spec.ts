import { describe, it, expect } from "vitest";
import { Library, Runtime } from "@observablehq/runtime";
import type { ohq } from "@hpcc-js/observablehq-compiler";
import { compile } from "@hpcc-js/observablehq-compiler/dist/index.esm";

describe("observablehq-compiler", function () {
    it("esm imports", async () => {
        const define = await compile(
            `\
m1 = import("../tests/m1.mjs");
x = m1.f(5, 7);
`);
        const library = new Library();
        const runtime = new Runtime(library);
        const main: ohq.Module = define(runtime, name => {
            return {
                pending() { },
                fulfilled(value) { console.info("fulfilled", name, value); },
                rejected(error) { console.error("rejected", name, error); },
            };
        });
        expect(await main.value("x")).to.equal(35);
    });
});

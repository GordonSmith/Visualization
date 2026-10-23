import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { build } from "esbuild";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { sfxWasm, wrap } from "../src/sfx-wrapper.ts";

interface GeneratedModule {
    default: () => Promise<{ wasmBinary: Uint8Array }>;
    reset(): void;
    WasmModuleResource: (new () => {
        readonly ready: Promise<{ wasmBinary: Uint8Array }>;
        readonly instance: { wasmBinary: Uint8Array } | undefined;
        dispose(): void;
        [Symbol.dispose](): void;
    }) & { instantiate(): Promise<InstanceType<GeneratedModule["WasmModuleResource"]>> };
}

function encodeULEB128(value: number): number[] {
    const bytes: number[] = [];
    do {
        const byte = value & 0x7f;
        value >>>= 7;
        bytes.push(value ? byte | 0x80 : byte);
    } while (value);
    return bytes;
}

function makeWasmFixture(): Uint8Array {
    const customData = new Uint8Array(64 * 1024);
    const customPayload = new Uint8Array(1 + customData.length);
    customPayload.set(encodeULEB128(0));
    customPayload.set(customData, 1);
    const customSection = new Uint8Array(1 + encodeULEB128(customPayload.length).length + customPayload.length);
    customSection[0] = 0;
    const sectionSize = encodeULEB128(customPayload.length);
    customSection.set(sectionSize, 1);
    customSection.set(customPayload, 1 + sectionSize.length);

    const wasm = new Uint8Array(8 + customSection.length);
    wasm.set([0, 97, 115, 109, 1, 0, 0, 0]);
    wasm.set(customSection, 8);
    return wasm;
}

describe("sfxWasm", () => {
    let directory: string;
    let wasmPath: string;
    let wasmJsPath: string;
    let wasmBytes: Uint8Array;
    let generatedModule: GeneratedModule;

    beforeAll(async () => {
        directory = await mkdtemp(join(process.cwd(), ".sfx-wasm-test-"));
        wasmPath = join(directory, "fixture.wasm");
        wasmJsPath = join(directory, "fixture.js");
        wasmBytes = makeWasmFixture();
        await writeFile(wasmPath, wasmBytes);
        await writeFile(wasmJsPath, `export default ({ wasmBinary }) => Promise.resolve({ wasmBinary });`);

        const generated = await wrap(wasmPath);
        expect(generated).toContain('import { decompress } from "fzstd";');

        const outputPath = join(directory, "fixture.mjs");
        await build({
            entryPoints: [wasmPath],
            outfile: outputPath,
            bundle: true,
            format: "esm",
            platform: "node",
            plugins: [sfxWasm()],
        });
        generatedModule = await import(pathToFileURL(outputPath).href);
    });

    afterAll(async () => {
        await rm(directory, { recursive: true, force: true });
    });

    it("decodes a compressed WASM module through the esbuild plugin", async () => {
        const decoded = (await generatedModule.default()).wasmBinary;

        expect(decoded).toBeInstanceOf(Uint8Array);
        expect(decoded).toEqual(wasmBytes);
        expect(WebAssembly.validate(decoded)).toBe(true);
    });

    it("requires an Emscripten glue file next to the WASM file", async () => {
        const noGlueDirectory = join(directory, "no-glue");
        await mkdir(noGlueDirectory);
        const noGlueWasmPath = join(noGlueDirectory, "fixture.wasm");
        await writeFile(noGlueWasmPath, wasmBytes);

        await expect(build({
            entryPoints: [noGlueWasmPath],
            outfile: join(noGlueDirectory, "fixture.mjs"),
            bundle: true,
            format: "esm",
            platform: "node",
            plugins: [sfxWasm()],
            logLevel: "silent",
        })).rejects.toThrow(/Could not resolve/);
    });

    it("preserves the default loader and reset exports", async () => {
        const first = await generatedModule.default();

        expect((await generatedModule.default()).wasmBinary).toBe(first.wasmBinary);

        generatedModule.reset();
        const afterReset = await generatedModule.default();
        expect(afterReset.wasmBinary).toEqual(wasmBytes);
        expect(afterReset.wasmBinary).not.toBe(first.wasmBinary);
    });

    it("exposes a resource that tracks and releases the loaded module", async () => {
        const resource = new generatedModule.WasmModuleResource();
        expect(resource.instance).toBeUndefined();

        const module = await resource.ready;
        expect(resource.instance).toBe(module);
        expect(module.wasmBinary).toEqual(wasmBytes);

        resource.dispose();
        expect(resource.instance).toBeUndefined();
        expect((await generatedModule.default()).wasmBinary).not.toBe(module.wasmBinary);
    });

    it("releases the module if disposed before loading completes", async () => {
        const resource = new generatedModule.WasmModuleResource();
        resource.dispose();

        const module = await resource.ready;
        expect(resource.instance).toBeUndefined();
        expect((await generatedModule.default()).wasmBinary).not.toBe(module.wasmBinary);
    });

    it("supports explicit resource management with `using`", async () => {
        let module: { wasmBinary: Uint8Array };
        let resource: InstanceType<GeneratedModule["WasmModuleResource"]>;
        {
            using scoped = new generatedModule.WasmModuleResource();
            resource = scoped;
            module = await scoped.ready;
            expect(scoped.instance).toBe(module);
        }

        expect(resource.instance).toBeUndefined();
        expect((await generatedModule.default()).wasmBinary).not.toBe(module.wasmBinary);
    });

    it("creates an already-instantiated resource with WasmModuleResource.instantiate()", async () => {
        const resource = await generatedModule.WasmModuleResource.instantiate();
        expect(resource.instance?.wasmBinary).toEqual(wasmBytes);

        resource.dispose();
        expect(resource.instance).toBeUndefined();
    });
});

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { wrap, sfxWasm } from "../src/sfx-wrapper.js";
import { writeFileSync, mkdirSync, rmSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";

describe("sfx-wrapper", function () {
    const testDir = join(tmpdir(), "sfx-wrapper-test");
    const mockWasmData = new Uint8Array([0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00]); // Basic WASM header

    beforeEach(() => {
        // Create test directory
        try {
            mkdirSync(testDir, { recursive: true });
        } catch (e) {
            // Directory might already exist
        }
    });

    afterEach(() => {
        // Clean up test directory
        try {
            rmSync(testDir, { recursive: true, force: true });
        } catch (e) {
            // Ignore cleanup errors
        }
    });

    describe("wrap function", function () {
        it("should process a WASM file and return TypeScript code", async function () {
            const testWasmPath = join(testDir, "test.wasm");
            writeFileSync(testWasmPath, mockWasmData);

            const result = await wrap(testWasmPath);

            expect(result).toBeTypeOf("string");
            expect(result).toContain("function decode(raw: string): Uint8Array");
            expect(result).toContain("export default function()");
            expect(result).toContain("export function reset()");
            expect(result).toContain("const table = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!#$%&()*+,./:;<=>?@[]^_`{|}~\"'");
        });

        it("should handle compression decision correctly", async function () {
            const testWasmPath = join(testDir, "test2.wasm");
            writeFileSync(testWasmPath, mockWasmData);

            const result = await wrap(testWasmPath);

            // The result should contain either compressed or uncompressed logic
            const hasCompressedImport = result.includes('import { decompress } from "fzstd"');
            const hasDecompressCall = result.includes("decompress(decode(blobStr))");
            const hasDirectDecodeCall = result.includes("decode(blobStr)") && !hasDecompressCall;

            expect(hasCompressedImport === hasDecompressCall).toBe(true);
            expect(hasCompressedImport || hasDirectDecodeCall).toBe(true);
        });

        it("should include wrapper import when JS file exists", async function () {
            const testWasmPath = join(testDir, "test3.wasm");
            const testJsPath = join(testDir, "test3.js");

            writeFileSync(testWasmPath, mockWasmData);
            writeFileSync(testJsPath, "export default function() { return {}; }");

            const result = await wrap(testWasmPath);

            expect(result).toContain(`import wrapper from "${testJsPath}"`);
            expect(result).toContain("wrapper({");
            expect(result).toContain("wasmBinary: g_wasmBinary");
            expect(result).toContain('locateFile: (name: string) => "sfx-wrapper nop"');
        });

        it("should return binary directly when no JS wrapper exists", async function () {
            const testWasmPath = join(testDir, "test4.wasm");
            writeFileSync(testWasmPath, mockWasmData);

            const result = await wrap(testWasmPath);

            expect(result).not.toContain("import wrapper from");
            expect(result).toContain("return g_wasmBinary;");
        });

        it("should handle .js extension in path correctly", async function () {
            const testJsPath = join(testDir, "test5.js");
            writeFileSync(testJsPath, mockWasmData);

            const result = await wrap(testJsPath);

            expect(result).toBeTypeOf("string");
            expect(result).toContain("export default function()");
        });
    });

    describe("sfxWasm plugin", function () {
        it("should return a valid esbuild plugin", function () {
            const plugin = sfxWasm();

            expect(plugin).toBeTypeOf("object");
            expect(plugin.name).toBe("sfx-wasm");
            expect(plugin.setup).toBeTypeOf("function");
        });

        it("should create proper plugin structure", function () {
            const plugin = sfxWasm();

            // Mock build object
            const mockBuild = {
                onLoad: function (options: any, callback: any) {
                    expect(options.filter).toBeTypeOf("object");
                    expect(options.filter.test(".wasm")).toBe(true);
                    expect(callback).toBeTypeOf("function");
                }
            };

            // This should not throw
            plugin.setup(mockBuild as any);
        });
    });

    describe("generated code structure", function () {
        it("should generate valid base91 decode implementation", async function () {
            const testWasmPath = join(testDir, "decode-test.wasm");
            writeFileSync(testWasmPath, mockWasmData);

            const result = await wrap(testWasmPath);

            // Check for proper base91 decode function structure
            expect(result).toContain("function decode(raw: string): Uint8Array");
            expect(result).toContain("const len = raw.length");
            expect(result).toContain("const ret: number[] = []");
            expect(result).toContain("let b = 0");
            expect(result).toContain("let n = 0");
            expect(result).toContain("let v = -1");
            expect(result).toContain("for (let i = 0; i < len; i++)");
            expect(result).toContain("table.indexOf(raw[i])");
            expect(result).toContain("return new Uint8Array(ret)");
        });

        it("should include proper module caching logic", async function () {
            const testWasmPath = join(testDir, "cache-test.wasm");
            writeFileSync(testWasmPath, mockWasmData);

            const result = await wrap(testWasmPath);

            expect(result).toContain("let g_module: Uint8Array | undefined");
            expect(result).toContain("let g_wasmBinary: Uint8Array | undefined");
            expect(result).toContain("if (!g_wasmBinary)");
        });

        it("should include reset function", async function () {
            const testWasmPath = join(testDir, "reset-test.wasm");
            writeFileSync(testWasmPath, mockWasmData);

            const result = await wrap(testWasmPath);

            expect(result).toContain("export function reset()");
            expect(result).toContain("if (g_module)");
            expect(result).toContain("g_module = undefined");
        });
    });

    describe("error handling", function () {
        it("should handle non-existent files gracefully", async function () {
            const nonExistentPath = join(testDir, "non-existent.wasm");

            try {
                await wrap(nonExistentPath);
                expect.fail("Should have thrown an error");
            } catch (error) {
                expect(error).toBeInstanceOf(Error);
            }
        });
    });
});

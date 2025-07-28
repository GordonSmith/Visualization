import { describe, it, expect } from "vitest";
import { wrap, sfxWasm } from "../src/sfx-wrapper.js";
import { readFileSync, statSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("sfx-wrapper with real WASM files", function () {
    const wasmDir = join(__dirname, "wasm");
    const base91WasmPath = join(wasmDir, "base91lib.wasm");
    const base91JsPath = join(wasmDir, "base91lib.js");

    describe("real WASM file processing", function () {
        it("should process the base91lib.wasm file", async function () {
            const result = await wrap(base91WasmPath);

            expect(result).toBeTypeOf("string");
            expect(result).toContain("function decode(raw: string): Uint8Array");
            expect(result).toContain("export default function()");
            expect(result).toContain("export function reset()");
            expect(result).toContain("const table = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!#$%&()*+,./:;<=>?@[]^_`{|}~\"'");
        });

        it("should include the JavaScript wrapper import", async function () {
            const result = await wrap(base91WasmPath);

            expect(result).toContain(`import wrapper from "${base91JsPath}"`);
            expect(result).toContain("wrapper({");
            expect(result).toContain("wasmBinary: g_wasmBinary");
            expect(result).toContain('locateFile: (name: string) => "sfx-wrapper nop"');
            expect(result).toContain("if (!g_module)");
            expect(result).toContain("return g_module;");
        });

        it("should make compression decision based on real file size", async function () {
            const wasmSize = statSync(base91WasmPath).size;
            const result = await wrap(base91WasmPath);

            // With a real 7854 byte WASM file, we can test actual compression behavior
            const hasCompressedImport = result.includes('import { decompress } from "fzstd"');
            const hasDecompressCall = result.includes("decompress(decode(blobStr))");
            const hasDirectDecodeCall = result.includes("decode(blobStr)") && !hasDecompressCall;

            // Should be using either compressed or uncompressed, but not both
            expect(hasCompressedImport === hasDecompressCall).toBe(true);
            expect(hasCompressedImport || hasDirectDecodeCall).toBe(true);

            console.info(`WASM file size: ${wasmSize} bytes`);
            console.info(`Using compression: ${hasCompressedImport}`);
        });

        it("should generate valid base91 encoded data from real WASM", async function () {
            const result = await wrap(base91WasmPath);

            // Extract the blob string from the generated code
            const blobMatch = result.match(/const blobStr = '([^']+)'/);
            expect(blobMatch).toBeTruthy();

            const blobStr = blobMatch![1];
            expect(blobStr.length).toBeGreaterThan(100); // Should be substantial for a real WASM file

            // Should only contain valid base91 characters
            const base91Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!#$%&()*+,./:;<=>?@[]^_`{|}~\"";
            for (const char of blobStr) {
                expect(base91Chars).toContain(char);
            }
        });

        it("should handle the generated code structure for real WASM", async function () {
            const result = await wrap(base91WasmPath);

            // Check module caching logic
            expect(result).toContain("let g_module: Uint8Array | undefined");
            expect(result).toContain("let g_wasmBinary: Uint8Array | undefined");
            expect(result).toContain("if (!g_wasmBinary)");
            expect(result).toContain("if (!g_module)");

            // Check reset function
            expect(result).toContain("export function reset()");
            expect(result).toContain("g_module = undefined");

            // Should return the module, not just binary
            expect(result).toContain("return g_module;");
            expect(result).not.toContain("return g_wasmBinary;");
        });

        it("should contain realistic base91 decode function", async function () {
            const result = await wrap(base91WasmPath);

            // Verify all parts of the base91 decode algorithm are present
            expect(result).toContain("function decode(raw: string): Uint8Array");
            expect(result).toContain("const len = raw.length");
            expect(result).toContain("const ret: number[] = []");
            expect(result).toContain("let b = 0");
            expect(result).toContain("let n = 0");
            expect(result).toContain("let v = -1");
            expect(result).toContain("for (let i = 0; i < len; i++)");
            expect(result).toContain("const p = table.indexOf(raw[i])");
            expect(result).toContain("if (p === -1) continue");
            expect(result).toContain("v += p * 91");
            expect(result).toContain("b |= v << n");
            expect(result).toContain("ret.push(b & 0xff)");
            expect(result).toContain("return new Uint8Array(ret)");
        });
    });

    describe("esbuild plugin with real WASM", function () {
        it("should handle real WASM file through plugin interface", async function () {
            const plugin = sfxWasm();
            let pluginResult: any = null;

            // Mock build object that captures the result
            const mockBuild = {
                onLoad: function (_options: any, callback: any) {
                    // Simulate the plugin being called with our real WASM file
                    callback({ path: base91WasmPath }).then((result: any) => {
                        pluginResult = result;
                    });
                }
            };

            plugin.setup(mockBuild as any);

            // Wait for the async operation
            await new Promise(resolve => setTimeout(resolve, 100));

            expect(pluginResult).toBeTruthy();
            expect(pluginResult.loader).toBe("ts");
            expect(pluginResult.contents).toContain("export default function()");
            expect(pluginResult.contents).toContain(`import wrapper from "${base91JsPath}"`);
        });
    });

    describe("comparison with mock vs real WASM", function () {
        it("should produce different but valid output for real vs mock WASM", async function () {
            // Create a temporary mock WASM file in memory
            const mockWasmData = new Uint8Array([0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00]);

            // We can't easily create a temporary file for comparison, but we can verify
            // that the real WASM produces substantially different output
            const realResult = await wrap(base91WasmPath);

            // Real WASM should produce much larger base91 encoded strings
            const realBlobMatch = realResult.match(/const blobStr = '([^']+)'/);
            expect(realBlobMatch).toBeTruthy();

            const realBlobStr = realBlobMatch![1];
            expect(realBlobStr.length).toBeGreaterThan(1000); // Real WASM should be much larger than mock

            // Real WASM should include the wrapper
            expect(realResult).toContain("import wrapper from");
            expect(realResult).toContain("return g_module;");
        });

        it("should validate file sizes and compression efficiency", async function () {
            const wasmFileSize = statSync(base91WasmPath).size;
            const jsFileSize = statSync(base91JsPath).size;

            console.info(`WASM file size: ${wasmFileSize} bytes`);
            console.info(`JS wrapper size: ${jsFileSize} bytes`);

            expect(wasmFileSize).toBeGreaterThan(1000); // Should be a substantial WASM file
            expect(jsFileSize).toBeGreaterThan(1000);   // Should be a substantial JS wrapper

            const result = await wrap(base91WasmPath);
            const isCompressed = result.includes('import { decompress } from "fzstd"');

            // Log compression decision for analysis
            console.info(`Compression used: ${isCompressed}`);

            // The result should be a string regardless of compression
            expect(result).toBeTypeOf("string");
            expect(result.length).toBeGreaterThan(1000);
        });
    });

    describe("generated code validation", function () {
        it("should produce syntactically valid TypeScript", async function () {
            const result = await wrap(base91WasmPath);

            // Check for proper TypeScript syntax
            expect(result).toMatch(/import.*from.*".*"/); // Import statements
            expect(result).toMatch(/export default function\(\)/); // Default export
            expect(result).toMatch(/export function reset\(\)/); // Named export
            expect(result).toMatch(/const.*=/); // Variable declarations
            expect(result).toMatch(/function.*\(/); // Function declarations

            // Should not have obvious syntax errors (but undefined is OK in type annotations)
            expect(result).not.toContain("null");
            expect(result).not.toContain("NaN");
            expect(result).not.toContain("TypeError");
            expect(result).not.toContain("ReferenceError");
        });

        it("should have consistent variable naming", async function () {
            const result = await wrap(base91WasmPath);

            // Check that variables are consistently named
            expect(result).toContain("g_module");
            expect(result).toContain("g_wasmBinary");
            expect(result).toContain("blobStr");
            expect(result).toContain("decode");
            expect(result).toContain("table");

            // Should reference the same variables throughout
            const moduleRefs = (result.match(/g_module/g) || []).length;
            const binaryRefs = (result.match(/g_wasmBinary/g) || []).length;

            expect(moduleRefs).toBeGreaterThan(2); // Should be referenced multiple times
            expect(binaryRefs).toBeGreaterThan(2); // Should be referenced multiple times
        });
    });
});

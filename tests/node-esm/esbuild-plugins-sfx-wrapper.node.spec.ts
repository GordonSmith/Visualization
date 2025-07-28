import { expect, test, describe } from "vitest";
import { join } from "path";
import { tmpdir } from "os";
import { writeFileSync, mkdirSync, rmSync } from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const sfxWrapperPath = join(__dirname, "../../packages/esbuild-plugins/dist/sfx-wrapper.js");

describe("@hpcc-js/esbuild-plugins/sfx-wrapper", () => {
    const testDir = join(tmpdir(), "sfx-wrapper-vitest");
    const mockWasmData = new Uint8Array([0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00]); // Basic WASM header

    test("should successfully import the package", async () => {
        // Import the specific sfx-wrapper module using the file path
        const sfxWrapper = await import(sfxWrapperPath);
        expect(sfxWrapper).toBeDefined();
        expect(typeof sfxWrapper.wrap).toBe("function");
        expect(typeof sfxWrapper.sfxWasm).toBe("function");
    });

    test("wrap function should process a WASM file and return TypeScript code", async () => {
        // Setup test directory
        try {
            mkdirSync(testDir, { recursive: true });
        } catch (e) {
            // Directory might already exist
        }

        try {
            const { wrap } = await import(sfxWrapperPath);
            
            const testWasmPath = join(testDir, "test.wasm");
            writeFileSync(testWasmPath, mockWasmData);

            const result = await wrap(testWasmPath);

            expect(typeof result).toBe("string");
            expect(result).toContain("function decode(raw: string): Uint8Array");
            expect(result).toContain("export default function()");
            expect(result).toContain("export function reset()");
            expect(result).toContain("const table = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!#$%&()*+,./:;<=>?@[]^_`{|}~\"'");
        } finally {
            // Cleanup
            try {
                rmSync(testDir, { recursive: true, force: true });
            } catch (e) {
                // Ignore cleanup errors
            }
        }
    });

    test("sfxWasm should return a valid esbuild plugin", async () => {
        const { sfxWasm } = await import(sfxWrapperPath);
        
        const plugin = sfxWasm();

        expect(plugin).toBeDefined();
        expect(plugin.name).toBe("sfx-wasm");
        expect(typeof plugin.setup).toBe("function");
    });

    test("wrap function should handle JS wrapper files", async () => {
        // Setup test directory  
        try {
            mkdirSync(testDir, { recursive: true });
        } catch (e) {
            // Directory might already exist
        }

        try {
            const { wrap } = await import(sfxWrapperPath);
            
            const testWasmPath = join(testDir, "test-with-js.wasm");
            const testJsPath = join(testDir, "test-with-js.js");
            
            writeFileSync(testWasmPath, mockWasmData);
            writeFileSync(testJsPath, "export default function() { return {}; }");

            const result = await wrap(testWasmPath);

            expect(result).toContain(`import wrapper from "${testJsPath}"`);
            expect(result).toContain("wrapper({");
            expect(result).toContain("wasmBinary: g_wasmBinary");
        } finally {
            // Cleanup
            try {
                rmSync(testDir, { recursive: true, force: true });
            } catch (e) {
                // Ignore cleanup errors
            }
        }
    });

    test("wrap function should handle files without JS wrapper", async () => {
        // Setup test directory
        try {
            mkdirSync(testDir, { recursive: true });
        } catch (e) {
            // Directory might already exist
        }

        try {
            const { wrap } = await import(sfxWrapperPath);
            
            const testWasmPath = join(testDir, "test-no-js.wasm");
            writeFileSync(testWasmPath, mockWasmData);

            const result = await wrap(testWasmPath);

            expect(result).not.toContain("import wrapper from");
            expect(result).toContain("return g_wasmBinary;");
        } finally {
            // Cleanup
            try {
                rmSync(testDir, { recursive: true, force: true });
            } catch (e) {
                // Ignore cleanup errors
            }
        }
    });
});

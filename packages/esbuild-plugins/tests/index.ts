import { expect } from "chai";

describe("@hpcc-js/esbuild-plugins", function () {
    it("version", async function () {
        // Basic smoke test - just checking the package can be imported
        const pkg = await import("@hpcc-js/esbuild-plugins");
        expect(pkg).to.be.an("object");
    });
});

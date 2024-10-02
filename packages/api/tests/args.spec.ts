import { describe, it, expect } from "vitest";

describe("arguments", function () {
    function testArgs(a?: number, b?: number, c?: number): IArguments {
        return arguments;
    }

    it("all", function () {
        const args = testArgs(1, 2, 3);
        expect(args.length).to.equal(3);
        expect(args[0]).to.equal(1);
        expect(args[1]).to.equal(2);
        expect(args[2]).to.equal(3);
    });
    it("none", function () {
        const args = testArgs();
        expect(args.length).to.equal(0);
    });
});

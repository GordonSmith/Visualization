import { describe, expect, it, vi } from "vitest";
import { SharedPtr } from "@hpcc-js/util";

describe("SharedPtr", () => {
    it("constructs a resource with `make`", () => {
        const dispose = vi.fn();
        class Resource implements Disposable {
            constructor(
                readonly id: number,
                readonly name: string,
                readonly enabled: boolean,
                readonly tags: string[],
            ) { }
            [Symbol.dispose] = dispose;
        }

        const tags = ["shared", "resource"];
        const owner = SharedPtr.make(Resource, 1, "example", true, tags);
        expect(owner.get()).toMatchObject({ id: 1, name: "example", enabled: true, tags });
        owner.dispose();
        expect(dispose).toHaveBeenCalledOnce();
    });

    it("keeps a resource alive until the final owner is disposed", () => {
        const dispose = vi.fn();
        const value = { id: 1, [Symbol.dispose]: dispose };
        const first = new SharedPtr(value);
        const second = first.copy();

        first.dispose();
        expect(first.get()).toBeUndefined();
        expect(second.get()).toBe(value);
        expect(dispose).not.toHaveBeenCalled();

        second.dispose();
        second.dispose();
        expect(second.get()).toBeUndefined();
        expect(dispose).toHaveBeenCalledOnce();
    });

    it("copying a disposed owner yields an empty owner", () => {
        const dispose = vi.fn();
        const owner = new SharedPtr({ [Symbol.dispose]: dispose });
        owner.dispose();
        expect(owner.copy().get()).toBeUndefined();
        expect(dispose).toHaveBeenCalledOnce();
    });

    it("disposes via `using`", () => {
        const dispose = vi.fn();
        const owner = new SharedPtr({ [Symbol.dispose]: dispose });
        {
            using scoped = owner.copy();
            expect(scoped.get()).toBeDefined();
        }
        expect(dispose).not.toHaveBeenCalled();
        owner.dispose();
        expect(dispose).toHaveBeenCalledOnce();
    });
});

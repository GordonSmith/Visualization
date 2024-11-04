import * as react from "@hpcc-js/react";
import { Class, HTMLWidget, SVGWidget } from "@hpcc-js/common";
import { describe, it, expect } from "vitest";
import { classDef, renderMedium, renderShort, renderSmall, renderWide } from "../../common/tests/index.ts";

const urlSearch: string = window.location.href.split("?")[1];

describe("@hpcc-js/react", () => {
    for (const key in react) {
        const item = (react as any)[key];
        if (item && item.prototype && item.prototype.constructor) {
            if (!urlSearch || urlSearch === item.prototype.constructor.name) {
                describe(`${item.prototype?.constructor?.name}`, () => {
                    it("Simple", () => {
                        expect(true).to.be.true;
                    });
                    if (item.prototype instanceof Class) {
                        classDef("react", item);
                    }
                    if (item.prototype instanceof HTMLWidget || item.prototype instanceof SVGWidget) {
                        switch (item.prototype.constructor) {

                            default:
                                it("Has render test", () => {
                                    expect(false).to.be.true;
                                });
                        }
                    }
                });
            }
        }
    }
});

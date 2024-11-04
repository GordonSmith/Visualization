import * as react from "@hpcc-js/html";
import { Class, HTMLWidget, SVGWidget } from "@hpcc-js/common";
import { describe, it, expect } from "vitest";
import { classDef, renderMedium, renderShort, renderSmall, renderWide } from "../../common/tests/index.ts";

const urlSearch: string = window.location.href.split("?")[1];

describe("@hpcc-js/html", () => {
    for (const key in html) {
        const item = (html as any)[key];
        if (item) {
            if (!urlSearch || urlSearch === item.prototype.constructor.name) {
                describe(`${item.prototype?.constructor?.name}`, () => {
                    it("Simple", () => {
                        expect(true).to.be.true;
                    });
                    if (item.prototype instanceof Class) {
                        classDef("html", item);
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

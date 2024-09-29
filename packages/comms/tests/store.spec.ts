import { describe, it, expect } from "vitest";

import { Store } from "@hpcc-js/comms";
import { ESP_URL } from "./testLib.ts";

describe("@hpcc-js/comms-Topology", () => {
    const store = Store.attach({ baseUrl: ESP_URL }, "HPCCApps", "testing", false);

    it("Basic", () => {
        expect(store).exist;
    });

    it("set/get", async () => {
        await store.set("Key001", "42");
        expect(await store.get("Key001")).to.equal("42");
        await store.set("Key001", "43");
        expect(await store.get("Key001")).to.equal("43");
    });

    it("delete", () => {
        return store.get("Key001").then(response => {
            expect(response).to.equal("43");
        }).then(response => {
            return store.delete("Key001");
        }).then(response => {
            return store.get("Key001");
        }).then(response => {
            expect(response).to.equal(undefined);
            return store.delete("Key001");
        }).then(response => {
            expect(response).to.equal(undefined);
        });
    });

    const store2 = Store.attach({ baseUrl: ESP_URL }, "HPCCApps", "monitor-testing", false);
    it("monitor", () => {
        return new Promise<void>((done, fail) => {
            const handle = store2.monitor(messages => {
                messages.forEach(m => console.log(`${m.key}:  ${m.oldValue} -> ${m.value}`));
                setTimeout(() => {
                    handle.release();
                    done();
                }, 1000);
            });
            store2.set("Key001", "22").then(() => {
                return store2.set("Key001", "23");
            }).then(() => {
                return store2.set("Key001", "24");
            }).then(() => {
                return store2.set("Key001", "25");
            }).then(() => {
                return store2.set("Key001", "26");
            }).then(() => {
                return store2.set("Key001", "27");
            }).then(() => {
                return store2.set("Key001", "28");
            }).then(() => {
                return store2.set("Key001", "29");
            });
            store2.set("Key007", "22").then(() => {
                return store2.set("Key007", "23");
            }).then(() => {
                return store2.set("Key007", "24");
            }).then(() => {
                return store2.set("Key007", "25");
            }).then(() => {
                return store2.set("Key007", "26");
            }).then(() => {
                return store2.set("Key007", "27");
            }).then(() => {
                return store2.set("Key007", "28");
            }).then(() => {
                return store2.set("Key007", "29");
            }).then(() => {
                return store2.set("Key007", "30");
            }).then(() => {
                return store2.set("Key007", "31");
            }).then(() => {
                return store2.delete("Key007");
            });
        });
    });
});

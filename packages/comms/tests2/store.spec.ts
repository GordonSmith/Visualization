import { describe, it, expect } from "vitest";

import { Store } from "@hpcc-js/comms";
import { ESP_URL } from "./testLib.ts";

describe("@hpcc-js/comms-Topology", () => {
    const store = Store.attach({ baseUrl: ESP_URL }, "HPCCApps", "testing", false);

    it("Basic", () => {
        expect(store).exist;
    });

    it("set/get", async () => {
        await store.set(`set/get`, "42");
        expect(await store.get("set/get")).to.equal("42");
        await store.set("set/get", "43");
        expect(await store.get("set/get")).to.equal("43");
    });

    it("delete", () => {
        return store.set("delete", "44").then(response => {
            return store.get("delete");
        }).then(response => {
            expect(response).to.equal("44");
            return store.delete("delete");
        }).then(response => {
            return store.get("delete");
        }).then(response => {
            expect(response).to.equal(undefined);
            return store.delete("delete");
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
            store2.set("monitor", "22").then(() => {
                return store2.set("monitor", "23");
            }).then(() => {
                return store2.set("monitor", "24");
            }).then(() => {
                return store2.set("monitor", "25");
            }).then(() => {
                return store2.set("monitor", "26");
            }).then(() => {
                return store2.set("monitor", "27");
            }).then(() => {
                return store2.set("monitor", "28");
            }).then(() => {
                return store2.set("monitor", "29");
            });
            store2.set("monitor-2", "22").then(() => {
                return store2.set("monitor-2", "23");
            }).then(() => {
                return store2.set("monitor-2", "24");
            }).then(() => {
                return store2.set("monitor-2", "25");
            }).then(() => {
                return store2.set("monitor-2", "26");
            }).then(() => {
                return store2.set("monitor-2", "27");
            }).then(() => {
                return store2.set("monitor-2", "28");
            }).then(() => {
                return store2.set("monitor-2", "29");
            }).then(() => {
                return store2.set("monitor-2", "30");
            }).then(() => {
                return store2.set("monitor-2", "31");
            }).then(() => {
                return store2.delete("monitor-2");
            });
        });
    });
});

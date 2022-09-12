import { expect } from "chai";
import { Runtime } from "@hpcc-js/observable-shim/dist/runtime";
import { Library } from "@hpcc-js/observable-shim/dist/stdlib";
import { compile } from "../node/compiler";
import { ojs2ohqnb } from "../node/util";

const ojs = `
a = 1
b = 2
c = a + b
d = {
  yield 1;
  yield 2;
  yield 3;
}

viewof e = {
  let output = {};
  let listeners = [];
  output.value = 10;
  output.addEventListener = (listener) => listeners.push(listener);;
  output.removeEventListener = (listener) => {
    listeners = listeners.filter(l => l !== listener);
  };
  return output;
}

threeTimes = {
  for (let i = 0; i < 3; i++) {
    yield Promises.delay(33);
  }
}

f = {
  threeTimes;
  return (this || 0) + 1;
}

`;

describe("ojs", function () {
    it("simple", async function () {
        this.timeout(10000);

        const ohqnb = ojs2ohqnb(ojs);
        const define = await compile(ohqnb);

        const library = new Library();
        const runtime = new Runtime(library, {});
        const main = define(runtime, name => {
            return {
                pending() { console.info("pending", name); },
                fulfilled(value) { console.info("fulfilled", name, value); },
                rejected(error) { console.error("rejected", name, error); },

            };
        });

        expect(await main.value("d")).to.equal(1);
        expect(await main.value("d")).to.equal(2);
        expect(await main.value("d")).to.equal(3);
        expect(await main.value("d")).to.equal(3);
        expect(await main.value("d")).to.equal(3);

        expect(await main.value("c")).to.equal(3);
        expect(await main.value("a")).to.equal(1);
        expect(await main.value("b")).to.equal(2);


        expect(await main.value("e")).to.equal(10);
        const viewOfE = await main.value("viewof e");
        expect(viewOfE).to.have.property("value");
        expect(viewOfE).to.have.property("addEventListener");
        expect(viewOfE).to.have.property("removeEventListener");

        // await main.value("threeTimes");
        // expect(await main.value("f")).to.equal(1);
        // await library.Promises.delay(100);
        // expect(await main.value("f")).to.equal(2);
        // await library.Promises.delay(100);
        // expect(await main.value("f")).to.equal(3);
    });
});


import { describe, expect, it } from "vitest";
import { DotWriter } from "../src/graphviz/DotWriter.ts";
import { Store } from "../src/graphviz/Store.ts";
import type { Cluster, Edge, Node } from "../src/graphviz/types.ts";

describe("Graphviz.Store", () => {
    it("does not expose its internal root subgraph", () => {
        const store = new Store()
            .load(
                [{ id: "a" }],
                [],
                [{ id: "sg" }]
            );

        expect(store.subgraphs().map(sg => sg.id)).to.deep.equal(["sg"]);
    });

    it("rejects duplicate and unknown IDs while loading", () => {
        expect(() => new Store().load([{ id: "a" }, { id: "a" }], []))
            .to.throw("Duplicate vertex ID: a");
        expect(() => new Store().load([{ id: "a", parentID: "missing" }], []))
            .to.throw("Unknown parent subgraph ID: missing");
        expect(() => new Store().load([{ id: "a" }], [{ id: "e", sourceID: "a", targetID: "missing" }]))
            .to.throw("Unknown target vertex ID: missing");
    });

    it("builds selected views for root vertices", () => {
        const vertices: Node[] = [{ id: "a" }, { id: "b" }];
        const edges: Edge[] = [{ id: "e", sourceID: "a", targetID: "b" }];
        const store = new Store()
            .load(
                vertices,
                edges
            );

        const view = store.createView(["a"]);

        expect(view.vertices().map(v => v.id)).to.deep.equal(["a"]);
        expect(view.edges()).to.deep.equal([]);
    });
});

describe("Graphviz.DotWriter", () => {
    it("writes only user graph items", () => {
        const vertices: Node[] = [{ id: "a" }];
        const subgraphs: Cluster[] = [{ id: "sg" }];
        const store = new Store()
            .load(
                vertices,
                [],
                subgraphs
            );

        const { dot } = new DotWriter(store).writeGraph();

        expect(dot).to.contain("subgraph \"cluster_sg\"");
        expect(dot).to.contain("\"a\" [id=\"a\"]");
        expect(dot).not.to.contain("cluster_undefined");
    });

    it("quotes DOT IDs and string values", () => {
        const vertices: Node[] = [{ id: "a\"1", label: "Alpha \"One\"" }];
        const store = new Store()
            .load(
                vertices,
                []
            );

        const { dot } = new DotWriter(store).writeGraph();

        expect(dot).to.contain("\"a\\\"1\" [id=\"a\\\"1\" label=\"Alpha \\\"One\\\"\"]");
    });

    it("uses undirected edge syntax for graph output", () => {
        const vertices: Node[] = [{ id: "a" }, { id: "b" }];
        const edges: Edge[] = [{ id: "e", sourceID: "a", targetID: "b" }];
        const store = new Store()
            .load(
                vertices,
                edges,
                [],
                { type: "graph" }
            );

        const { dot } = new DotWriter(store).writeGraph();

        expect(dot).to.contain("\"a\" -- \"b\"");
        expect(dot).not.to.contain("\"a\" -> \"b\"");
    });
});
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

    it("builds a partial view from starting subgraphs and adds ghost-expand vertices for cross-boundary edges", () => {
        const vertices: Node[] = [
            { id: "a", parentID: "sg1", label: "A" },
            { id: "b", parentID: "sg2", label: "B" },
            { id: "c", parentID: "sg3", label: "C" },
        ];
        const edges: Edge[] = [
            { id: "e_ab", sourceID: "a", targetID: "b" },   // both visible
            { id: "e_bc", sourceID: "b", targetID: "c" },   // c hidden -> ghost
            { id: "e_ac", sourceID: "a", targetID: "c" },   // c hidden -> reuse ghost
        ];
        const subgraphs: Cluster[] = [{ id: "sg1" }, { id: "sg2" }, { id: "sg3" }];
        const store = new Store().load(vertices, edges, subgraphs);

        const view = store.createPartialView(["sg1", "sg2"]);

        const vIds = view.vertices().map(v => v.id).sort();
        expect(vIds).to.deep.equal(["a", "b", "c"]);

        // The "c" vertex in the view is a ghost — different object reference, no parent, ghost-expand class
        const ghost = view.vertices().find(v => v.id === "c")!;
        expect(ghost).to.not.equal(vertices[2]);
        expect(ghost.parentID).to.equal(undefined);
        expect(view.parentSubgraph(ghost)).to.equal(view.rootSubgraph());
        expect(ghost.class).to.contain("ghost-expand");
        expect(ghost.label).to.equal("C");

        // All three edges retained (none of them had both endpoints hidden)
        expect(view.edges().map(e => e.id).sort()).to.deep.equal(["e_ab", "e_ac", "e_bc"]);
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

    it("renders a partial view with ghost-expand vertices outside the visible subgraphs", () => {
        const vertices: Node[] = [
            { id: "a", parentID: "sg1" },
            { id: "b", parentID: "sg2" },
        ];
        const edges: Edge[] = [
            { id: "e_ab", sourceID: "a", targetID: "b" },
        ];
        const subgraphs: Cluster[] = [{ id: "sg1" }, { id: "sg2" }];
        const store = new Store().load(vertices, edges, subgraphs);

        const { dot } = new DotWriter(store).writeGraph({ subgraphs: ["sg1"] });

        expect(dot).to.contain("subgraph \"cluster_sg1\"");
        expect(dot).not.to.contain("cluster_sg2");
        expect(dot).to.contain("ghost-expand");
        expect(dot).to.contain("shape=\"folder\"");
        expect(dot).to.contain("\"a\" -> \"b\"");
    });
});
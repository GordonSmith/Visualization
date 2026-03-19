import { describe, it, expect } from "vitest";

import { Graph2, Visitor } from "../src/index.ts";

interface MyVertex {
    id: string;
}

interface MyEdge {
    id: string;
    from: string;
    to: string;
}

interface MySubgraph {
    id: string;
}

function createGraph() {
    const graph = new Graph2<MyVertex, MyEdge, MySubgraph>();
    graph.idFunc(_ => _.id);
    graph.sourceFunc(_ => _.from);
    graph.targetFunc(_ => _.to);
    return graph;
}

describe("Graph2", function () {
    it("basic", function () {
        const graph = createGraph();
        const data = genData();
        data.vertices.forEach(v => graph.addVertex(v));
        data.edges.forEach(e => graph.addEdge(e));
        expect(graph.allVertices()).to.deep.equal(data.vertices);
        expect(graph.allEdges()).to.deep.equal(data.edges);

        const data2 = genData();
        data2.vertices.forEach(v => graph.addVertex(v));
        data2.edges.forEach(e => graph.addEdge(e));
        expect(graph.allVertices()).to.deep.equal([...data.vertices, ...data2.vertices]);
        expect(graph.allEdges()).to.deep.equal([...data.edges, ...data2.edges]);
        expect(graph.vertices()).to.deep.equal([...data.vertices, ...data2.vertices]);
        expect(graph.edges()).to.deep.equal([...data.edges, ...data2.edges]);

        graph.mergeVertices(data.vertices);
        expect(graph.allVertices()).to.deep.equal(data.vertices);
        expect(graph.allEdges()).to.deep.equal(data.edges);
        expect(graph.vertices()).to.deep.equal(data.vertices);
        expect(graph.edges()).to.deep.equal(data.edges);
        graph.mergeEdges(data.edges);
        expect(graph.allEdges()).to.deep.equal(data.edges);
        expect(graph.edges()).to.deep.equal(data.edges);

        graph.mergeVertices(data2.vertices);
        expect(graph.allVertices()).to.deep.equal(data2.vertices);
        expect(graph.vertices()).to.deep.equal(data2.vertices);

        graph.mergeVertices([]);
        expect(graph.allVertices().length).to.equal(0);
        expect(graph.vertices().length).to.equal(0);
    });

    it("removeVertex clears parent", function () {
        const graph = createGraph();
        const sg: MySubgraph = { id: "sg1" };
        const v1: MyVertex = { id: "v1" };
        const v2: MyVertex = { id: "v2" };

        graph.addSubgraph(sg);
        graph.addVertex(v1, sg);
        graph.addVertex(v2, sg);

        expect(graph.subgraphVertices("sg1")).to.deep.equal([v1, v2]);

        graph.removeVertex("v1");
        expect(graph.subgraphVertices("sg1")).to.deep.equal([v2]);
        expect(graph.vertexExists("v1")).to.equal(false);
    });

    it("removeEdge clears parent", function () {
        const graph = createGraph();
        const sg: MySubgraph = { id: "sg1" };
        const v1: MyVertex = { id: "v1" };
        const v2: MyVertex = { id: "v2" };
        const e1: MyEdge = { id: "e1", from: "v1", to: "v2" };

        graph.addSubgraph(sg);
        graph.addVertex(v1);
        graph.addVertex(v2);
        graph.addEdge(e1, sg);

        expect(graph.subgraphEdges("sg1")).to.deep.equal([e1]);

        graph.removeEdge("e1");
        expect(graph.subgraphEdges("sg1")).to.deep.equal([]);
        expect(graph.edgeExists("e1")).to.equal(false);
    });

    it("removeSubgraph clears parent", function () {
        const graph = createGraph();
        const parent: MySubgraph = { id: "sgParent" };
        const child: MySubgraph = { id: "sgChild" };

        graph.addSubgraph(parent);
        graph.addSubgraph(child, parent);

        expect(graph.subgraphSubgraphs("sgParent")).to.deep.equal([child]);

        graph.removeSubgraph("sgChild");
        expect(graph.subgraphSubgraphs("sgParent")).to.deep.equal([]);
        expect(graph.subgraphExists("sgChild")).to.equal(false);
    });

    it("removeSubgraph promotes children by default", function () {
        const graph = createGraph();
        const parent: MySubgraph = { id: "sgParent" };
        const child: MySubgraph = { id: "sgChild" };
        const v1: MyVertex = { id: "v1" };

        graph.addSubgraph(parent);
        graph.addSubgraph(child, parent);
        graph.addVertex(v1, child);

        expect(graph.subgraphVertices("sgChild")).to.deep.equal([v1]);

        graph.removeSubgraph("sgChild");
        // v1 should be promoted to sgParent
        expect(graph.subgraphVertices("sgParent")).to.deep.equal([v1]);
        expect(graph.vertexExists("v1")).to.equal(true);
    });

    it("removeSubgraph without promotion removes children", function () {
        const graph = createGraph();
        const sg: MySubgraph = { id: "sg1" };
        const v1: MyVertex = { id: "v1" };
        const v2: MyVertex = { id: "v2" };
        const e1: MyEdge = { id: "e1", from: "v1", to: "v2" };

        graph.addSubgraph(sg);
        graph.addVertex(v1, sg);
        graph.addVertex(v2);
        graph.addEdge(e1);

        graph.removeSubgraph("sg1", false);
        expect(graph.subgraphExists("sg1")).to.equal(false);
        expect(graph.vertexExists("v1")).to.equal(false);
        expect(graph.edgeExists("e1")).to.equal(false);
    });

    it("removeVertex removes associated edges", function () {
        const graph = createGraph();
        const v1: MyVertex = { id: "v1" };
        const v2: MyVertex = { id: "v2" };
        const v3: MyVertex = { id: "v3" };
        const e1: MyEdge = { id: "e1", from: "v1", to: "v2" };
        const e2: MyEdge = { id: "e2", from: "v2", to: "v3" };

        graph.addVertex(v1);
        graph.addVertex(v2);
        graph.addVertex(v3);
        graph.addEdge(e1);
        graph.addEdge(e2);

        graph.removeVertex("v2");
        expect(graph.vertexExists("v2")).to.equal(false);
        expect(graph.edgeExists("e1")).to.equal(false);
        expect(graph.edgeExists("e2")).to.equal(false);
        // v1, v3 should still have clean edge lists
        expect(graph.outEdges("v1")).to.deep.equal([]);
        expect(graph.inEdges("v3")).to.deep.equal([]);
    });

    it("subgraph parent operations", function () {
        const graph = createGraph();
        const sg1: MySubgraph = { id: "sg1" };
        const sg2: MySubgraph = { id: "sg2" };
        const v1: MyVertex = { id: "v1" };

        graph.addSubgraph(sg1);
        graph.addSubgraph(sg2);
        graph.addVertex(v1, sg1);

        expect(graph.subgraphParent("sg1")).to.equal(undefined);

        graph.subgraphParent("sg2", "sg1");
        expect(graph.subgraphParent("sg2")).to.deep.equal(sg1);

        graph.vertexParent("v1", "sg2");
        expect(graph.vertexParent("v1")).to.deep.equal(sg2);
        expect(graph.subgraphVertices("sg1")).to.deep.equal([]);
        expect(graph.subgraphVertices("sg2")).to.deep.equal([v1]);
    });

    it("findFirstVertex", function () {
        const graph = createGraph();
        const sgOuter: MySubgraph = { id: "sgOuter" };
        const sgInner: MySubgraph = { id: "sgInner" };
        const v1: MyVertex = { id: "v1" };
        const v2: MyVertex = { id: "v2" };

        graph.addSubgraph(sgOuter);
        graph.addSubgraph(sgInner, sgOuter);
        graph.addVertex(v1, sgInner);
        graph.addVertex(v2, sgOuter);

        // Direct vertex ID
        expect(graph.findFirstVertex("v1")).to.deep.equal(v1);
        // Subgraph with a direct vertex child
        expect(graph.findFirstVertex("sgOuter")).to.deep.equal(v2);
        // Subgraph containing vertex in nested subgraph
        graph.removeVertex("v2");
        expect(graph.findFirstVertex("sgOuter")).to.deep.equal(v1);
        // Nested subgraph directly
        expect(graph.findFirstVertex("sgInner")).to.deep.equal(v1);
        // Empty subgraph
        graph.removeVertex("v1");
        expect(graph.findFirstVertex("sgOuter")).to.equal(undefined);
        // Non-existent ID
        expect(graph.findFirstVertex("nope")).to.equal(undefined);
    });

    it("dijkstra shortest path", function () {
        const graph = createGraph();
        const v1: MyVertex = { id: "A" };
        const v2: MyVertex = { id: "B" };
        const v3: MyVertex = { id: "C" };

        graph.addVertex(v1);
        graph.addVertex(v2);
        graph.addVertex(v3);
        graph.addEdge({ id: "e1", from: "A", to: "B" });
        graph.addEdge({ id: "e2", from: "B", to: "C" });
        graph.addEdge({ id: "e3", from: "A", to: "C" });

        const result = graph.dijkstra("A", "C");
        expect(result.ids).to.deep.equal(["A", "C"]);
        expect(result.len).to.equal(1);
    });

    it("dijkstra with no path", function () {
        const graph = createGraph();
        graph.addVertex({ id: "A" });
        graph.addVertex({ id: "B" });
        // No edge between A and B
        const result = graph.dijkstra("A", "B");
        expect(result.len).to.equal(0);
        expect(result.ids).to.deep.equal(["B"]);
    });

    it("type(), isSubgraph(), isVertex(), isEdge()", function () {
        const graph = createGraph();
        const sg: MySubgraph = { id: "sg1" };
        const v1: MyVertex = { id: "v1" };
        const v2: MyVertex = { id: "v2" };
        const e1: MyEdge = { id: "e1", from: "v1", to: "v2" };

        graph.addSubgraph(sg);
        graph.addVertex(v1);
        graph.addVertex(v2);
        graph.addEdge(e1);

        expect(graph.type("sg1")).to.equal("S");
        expect(graph.type("v1")).to.equal("V");
        expect(graph.type("e1")).to.equal("E");
        expect(graph.type("nonexistent")).to.equal("");

        expect(graph.isSubgraph(sg)).to.equal(true);
        expect(graph.isVertex(v1)).to.equal(true);
        expect(graph.isEdge(e1)).to.equal(true);
        expect(graph.isSubgraph(v1)).to.equal(false);
        expect(graph.isVertex(sg)).to.equal(false);
        expect(graph.isEdge(v1)).to.equal(false);
    });

    it("allItems(), item(), itemExists()", function () {
        const graph = createGraph();
        const sg: MySubgraph = { id: "sg1" };
        const v1: MyVertex = { id: "v1" };
        const v2: MyVertex = { id: "v2" };
        const e1: MyEdge = { id: "e1", from: "v1", to: "v2" };

        graph.addSubgraph(sg);
        graph.addVertex(v1);
        graph.addVertex(v2);
        graph.addEdge(e1);

        expect(graph.allItems()).to.deep.equal([sg, v1, v2, e1]);

        expect(graph.item("sg1")).to.deep.equal(sg);
        expect(graph.item("v1")).to.deep.equal(v1);
        expect(graph.item("e1")).to.deep.equal(e1);
        expect(graph.item("nonexistent")).to.equal(undefined);

        expect(graph.itemExists("v1")).to.equal(true);
        expect(graph.itemExists("nonexistent")).to.equal(false);
    });

    it("itemParent()", function () {
        const graph = createGraph();
        const sg: MySubgraph = { id: "sg1" };
        const sg2: MySubgraph = { id: "sg2" };
        const v1: MyVertex = { id: "v1" };
        const v2: MyVertex = { id: "v2" };
        const e1: MyEdge = { id: "e1", from: "v1", to: "v2" };

        graph.addSubgraph(sg);
        graph.addSubgraph(sg2, sg);
        graph.addVertex(v1, sg);
        graph.addVertex(v2);
        graph.addEdge(e1, sg);

        expect(graph.itemParent("v1")).to.deep.equal(sg);
        expect(graph.itemParent("sg2")).to.deep.equal(sg);
        expect(graph.itemParent("e1")).to.deep.equal(sg);
        expect(graph.itemParent("v2")).to.equal(undefined);
        expect(graph.itemParent("nonexistent")).to.equal(undefined);
    });

    it("clear()", function () {
        const graph = createGraph();
        graph.addSubgraph({ id: "sg1" });
        graph.addVertex({ id: "v1" });
        graph.addVertex({ id: "v2" });
        graph.addEdge({ id: "e1", from: "v1", to: "v2" });

        graph.clear();

        expect(graph.allSubgraphs()).to.deep.equal([]);
        expect(graph.allVertices()).to.deep.equal([]);
        expect(graph.allEdges()).to.deep.equal([]);
    });

    it("clearParents()", function () {
        const graph = createGraph();
        const sg: MySubgraph = { id: "sg1" };
        const v1: MyVertex = { id: "v1" };

        graph.addSubgraph(sg);
        graph.addVertex(v1, sg);

        expect(graph.vertexParent("v1")).to.deep.equal(sg);

        graph.clearParents();
        expect(graph.vertexParent("v1")).to.equal(undefined);
        expect(graph.subgraphParent("sg1")).to.equal(undefined);
    });

    it("isDirected()", function () {
        const g1 = createGraph();
        expect(g1.isDirected()).to.equal(true);

        const g2 = new Graph2(false);
        expect(g2.isDirected()).to.equal(false);
    });

    it("subgraphs() returns only root-level", function () {
        const graph = createGraph();
        const sg1: MySubgraph = { id: "sg1" };
        const sg2: MySubgraph = { id: "sg2" };
        const sg3: MySubgraph = { id: "sg3" };

        graph.addSubgraph(sg1);
        graph.addSubgraph(sg2, sg1);
        graph.addSubgraph(sg3);

        expect(graph.allSubgraphs()).to.deep.equal([sg1, sg2, sg3]);
        expect(graph.subgraphs()).to.deep.equal([sg1, sg3]);
    });

    it("mergeSubgraphs()", function () {
        const graph = createGraph();
        const sg1: MySubgraph = { id: "sg1" };
        const sg2: MySubgraph = { id: "sg2" };

        graph.mergeSubgraphs([sg1, sg2]);
        expect(graph.allSubgraphs()).to.deep.equal([sg1, sg2]);

        graph.mergeSubgraphs([sg1]);
        expect(graph.allSubgraphs()).to.deep.equal([sg1]);

        graph.mergeSubgraphs([]);
        expect(graph.allSubgraphs()).to.deep.equal([]);
    });

    it("updateSubgraph()", function () {
        const graph = createGraph();
        const sg: MySubgraph = { id: "sg1" };
        graph.addSubgraph(sg);

        const sgUpdated: MySubgraph = { id: "sg1" };
        graph.updateSubgraph(sgUpdated);
        expect(graph.subgraph("sg1")).to.equal(sgUpdated);
    });

    it("vertexEdges(), inEdges(), outEdges()", function () {
        const graph = createGraph();
        graph.addVertex({ id: "v1" });
        graph.addVertex({ id: "v2" });
        graph.addVertex({ id: "v3" });
        const e1: MyEdge = { id: "e1", from: "v1", to: "v2" };
        const e2: MyEdge = { id: "e2", from: "v3", to: "v1" };
        graph.addEdge(e1);
        graph.addEdge(e2);

        expect(graph.vertexEdges("v1")).to.deep.equal([e2, e1]);
        expect(graph.inEdges("v1")).to.deep.equal([e2]);
        expect(graph.outEdges("v1")).to.deep.equal([e1]);
    });

    it("neighbors() and singleNeighbors()", function () {
        const graph = createGraph();
        const v1: MyVertex = { id: "v1" };
        const v2: MyVertex = { id: "v2" };
        const v3: MyVertex = { id: "v3" };

        graph.addVertex(v1);
        graph.addVertex(v2);
        graph.addVertex(v3);
        graph.addEdge({ id: "e1", from: "v1", to: "v2" });
        graph.addEdge({ id: "e2", from: "v1", to: "v3" });

        const neighbors = graph.neighbors("v1");
        expect(neighbors).to.deep.equal([v2, v3]);

        // v2 has 1 edge (e1), v3 has 1 edge (e2) — both are single neighbors
        expect(graph.singleNeighbors("v1")).to.deep.equal([v2, v3]);

        // Now give v2 another edge so it's no longer a single neighbor
        graph.addVertex({ id: "v4" });
        graph.addEdge({ id: "e3", from: "v2", to: "v4" });
        expect(graph.singleNeighbors("v1")).to.deep.equal([v3]);
    });

    it("internalOutEdges()", function () {
        const graph = createGraph();
        const sg: MySubgraph = { id: "sg1" };

        graph.addSubgraph(sg);
        graph.addVertex({ id: "v1" }, sg);
        graph.addVertex({ id: "v2" }, sg);
        graph.addVertex({ id: "v3" }); // no parent
        graph.addEdge({ id: "e1", from: "v1", to: "v2" }); // internal (both in sg1)
        graph.addEdge({ id: "e2", from: "v1", to: "v3" }); // external (different parents)

        const internal = graph.internalOutEdges("v1");
        expect(internal.length).to.equal(1);
        expect(internal[0].id).to.equal("e1");

        // v3 has no parent, so outEdges from v3 to another parentless vertex are internal
        graph.addVertex({ id: "v4" });
        graph.addEdge({ id: "e3", from: "v3", to: "v4" });
        const internalV3 = graph.internalOutEdges("v3");
        expect(internalV3.length).to.equal(1);
        expect(internalV3[0].id).to.equal("e3");
    });

    it("updateEdge() with same endpoints", function () {
        const graph = createGraph();
        graph.addVertex({ id: "v1" });
        graph.addVertex({ id: "v2" });
        const e1: MyEdge = { id: "e1", from: "v1", to: "v2" };
        graph.addEdge(e1);

        const e1Updated: MyEdge = { id: "e1", from: "v1", to: "v2" };
        graph.updateEdge(e1Updated);
        expect(graph.edge("e1")).to.equal(e1Updated);
    });

    it("updateEdge() with changed endpoints", function () {
        const graph = createGraph();
        graph.addVertex({ id: "v1" });
        graph.addVertex({ id: "v2" });
        graph.addVertex({ id: "v3" });
        graph.addEdge({ id: "e1", from: "v1", to: "v2" });

        expect(graph.outEdges("v1").length).to.equal(1);
        expect(graph.inEdges("v2").length).to.equal(1);

        // Change source and target
        graph.updateEdge({ id: "e1", from: "v3", to: "v1" });

        expect(graph.outEdges("v1").length).to.equal(0);
        expect(graph.inEdges("v2").length).to.equal(0);
        expect(graph.outEdges("v3").length).to.equal(1);
        expect(graph.inEdges("v1").length).to.equal(1);
    });

    it("hierarchy()", function () {
        const graph = createGraph();
        const sg: MySubgraph = { id: "sg1" };
        const v1: MyVertex = { id: "v1" };
        const v2: MyVertex = { id: "v2" };

        graph.addSubgraph(sg);
        graph.addVertex(v1, sg);
        graph.addVertex(v2);

        const result = graph.hierarchy((type, item, children) => {
            return { type, id: (item as any).id, children };
        });

        expect(result).to.deep.equal([
            { type: "subgraph", id: "sg1", children: [{ type: "vertex", id: "v1", children: undefined }] },
            { type: "vertex", id: "v2", children: undefined },
        ]);
    });

    it("lineage()", function () {
        const graph = createGraph();
        const sg1: MySubgraph = { id: "sg1" };
        const sg2: MySubgraph = { id: "sg2" };
        const v1: MyVertex = { id: "v1" };

        graph.addSubgraph(sg1);
        graph.addSubgraph(sg2, sg1);
        graph.addVertex(v1, sg2);

        const lineage = graph.lineage(v1);
        expect(lineage).to.deep.equal([sg1, sg2, v1]);

        // Root-level vertex has lineage of just itself
        const v2: MyVertex = { id: "v2" };
        graph.addVertex(v2);
        expect(graph.lineage(v2)).to.deep.equal([v2]);
    });

    it("childCount()", function () {
        const graph = createGraph();
        const sg1: MySubgraph = { id: "sg1" };
        const sg2: MySubgraph = { id: "sg2" };

        graph.addSubgraph(sg1);
        graph.addSubgraph(sg2, sg1);
        graph.addVertex({ id: "v1" }, sg1);
        graph.addVertex({ id: "v2" }, sg2);
        graph.addVertex({ id: "v3" }, sg2);

        // sg1 has 1 direct vertex + 2 in nested sg2 = 3
        expect(graph.childCount("sg1")).to.equal(3);
        expect(graph.childCount("sg2")).to.equal(2);
        // Non-existent subgraph returns 0
        expect(graph.childCount("nonexistent")).to.equal(0);
    });

    it("sort() topological ordering", function () {
        const graph = createGraph();
        graph.addVertex({ id: "A" });
        graph.addVertex({ id: "B" });
        graph.addVertex({ id: "C" });
        graph.addVertex({ id: "D" });
        graph.addEdge({ id: "e1", from: "A", to: "B" });
        graph.addEdge({ id: "e2", from: "B", to: "C" });
        graph.addEdge({ id: "e3", from: "A", to: "D" });

        const sorted = graph.sort();
        const indexOf = (id: string) => sorted.findIndex(v => v.id === id);
        // A should come before B, B before C, A before D
        expect(indexOf("A")).to.be.lessThan(indexOf("B"));
        expect(indexOf("B")).to.be.lessThan(indexOf("C"));
        expect(indexOf("A")).to.be.lessThan(indexOf("D"));
    });

    it("sort() from a specific vertex", function () {
        const graph = createGraph();
        graph.addVertex({ id: "A" });
        graph.addVertex({ id: "B" });
        graph.addVertex({ id: "C" });
        graph.addVertex({ id: "D" });
        graph.addEdge({ id: "e1", from: "A", to: "B" });
        graph.addEdge({ id: "e2", from: "B", to: "C" });
        graph.addEdge({ id: "e3", from: "C", to: "D" });

        // Sort only reachable from B
        const sorted = graph.sort("B");
        const ids = sorted.map(v => v.id);
        expect(ids).to.include("B");
        expect(ids).to.include("C");
        expect(ids).to.include("D");
        expect(ids).not.to.include("A");
    });

    it("sort() handles cycles gracefully", function () {
        const graph = createGraph();
        graph.addVertex({ id: "A" });
        graph.addVertex({ id: "B" });
        graph.addVertex({ id: "C" });
        graph.addEdge({ id: "e1", from: "A", to: "B" });
        graph.addEdge({ id: "e2", from: "B", to: "C" });
        graph.addEdge({ id: "e3", from: "C", to: "A" });

        const sorted = graph.sort();
        expect(sorted.length).to.equal(3);
    });

    it("updateFunc()", function () {
        const graph = createGraph();
        let updateCalled = false;
        graph.updateFunc((before, after) => {
            updateCalled = true;
            return after;
        });
        graph.addVertex({ id: "v1" });
        graph.addVertex({ id: "v2" });
        graph.mergeVertices([{ id: "v1" }]);
        expect(updateCalled).to.equal(true);
    });

    it("error handling", function () {
        const graph = createGraph();
        graph.addVertex({ id: "v1" });
        graph.addVertex({ id: "v2" });
        graph.addSubgraph({ id: "sg1" });

        expect(() => graph.addVertex({ id: "v1" })).to.throw("already exists");
        expect(() => graph.addSubgraph({ id: "sg1" })).to.throw("already exists");
        expect(() => graph.addEdge({ id: "e1", from: "v1", to: "v2" })).not.to.throw();
        expect(() => graph.addEdge({ id: "e1", from: "v1", to: "v2" })).to.throw("already exists");

        expect(() => graph.removeVertex("nonexistent")).to.throw("does not exist");
        expect(() => graph.removeEdge("nonexistent")).to.throw("does not exist");
        expect(() => graph.removeSubgraph("nonexistent")).to.throw("does not exist");

        expect(() => graph.updateVertex({ id: "nonexistent" })).to.throw("does not exist");
        expect(() => graph.updateEdge({ id: "nonexistent", from: "v1", to: "v2" })).to.throw("does not exist");
        expect(() => graph.updateSubgraph({ id: "nonexistent" })).to.throw("does not exist");

        expect(() => graph.vertexParent("nonexistent")).to.throw("does not exist");
        expect(() => graph.subgraphParent("nonexistent")).to.throw("does not exist");
        expect(() => graph.vertexParent("v1", "nonexistent")).to.throw("does not exist");
        expect(() => graph.subgraphParent("sg1", "nonexistent")).to.throw("does not exist");

        expect(() => graph.addVertex({ id: "v3" }, { id: "nonexistent" })).to.throw("does not exist");
        expect(() => graph.addSubgraph({ id: "sg2" }, { id: "nonexistent" })).to.throw("does not exist");
        expect(() => graph.addEdge({ id: "e2", from: "v1", to: "v2" }, { id: "nonexistent" })).to.throw("does not exist");
    });

    it("edges() returns only parentless edges", function () {
        const graph = createGraph();
        const sg: MySubgraph = { id: "sg1" };
        graph.addSubgraph(sg);
        graph.addVertex({ id: "v1" });
        graph.addVertex({ id: "v2" });
        const e1: MyEdge = { id: "e1", from: "v1", to: "v2" };
        graph.addEdge(e1, sg);

        // edges() should NOT include e1 since it has a parent
        expect(graph.edges()).to.deep.equal([]);
        expect(graph.allEdges()).to.deep.equal([e1]);
    });

    it("default id/source/target functions", function () {
        const graph = new Graph2();
        const v1 = { id: "a" };
        const v2 = { id: "b" };
        const e = { id: "e1", source: "a", target: "b" };

        graph.addVertex(v1);
        graph.addVertex(v2);
        graph.addEdge(e);

        expect(graph.allVertices()).to.deep.equal([v1, v2]);
        expect(graph.allEdges()).to.deep.equal([e]);
    });

    it("default id/source/target functions with methods", function () {
        const graph = new Graph2();
        const v1 = { id: () => "a" };
        const v2 = { id: () => "b" };
        const e = { id: () => "e1", source: () => "a", target: () => "b" };

        graph.addVertex(v1);
        graph.addVertex(v2);
        graph.addEdge(e);

        expect(graph.allVertices()).to.deep.equal([v1, v2]);
        expect(graph.allEdges()).to.deep.equal([e]);
    });

    it("vertices() returns only parentless vertices", function () {
        const graph = createGraph();
        const sg: MySubgraph = { id: "sg1" };
        const v1: MyVertex = { id: "v1" };
        const v2: MyVertex = { id: "v2" };

        graph.addSubgraph(sg);
        graph.addVertex(v1, sg);
        graph.addVertex(v2);

        expect(graph.vertices()).to.deep.equal([v2]);
        expect(graph.allVertices()).to.deep.equal([v1, v2]);
    });

    it("subgraphSubgraphs(), subgraphVertices(), subgraphEdges()", function () {
        const graph = createGraph();
        const sg1: MySubgraph = { id: "sg1" };
        const sg2: MySubgraph = { id: "sg2" };
        const v1: MyVertex = { id: "v1" };
        const v2: MyVertex = { id: "v2" };
        const e1: MyEdge = { id: "e1", from: "v1", to: "v2" };

        graph.addSubgraph(sg1);
        graph.addSubgraph(sg2, sg1);
        graph.addVertex(v1, sg1);
        graph.addVertex(v2, sg1);
        graph.addEdge(e1, sg1);

        expect(graph.subgraphSubgraphs("sg1")).to.deep.equal([sg2]);
        expect(graph.subgraphVertices("sg1")).to.deep.equal([v1, v2]);
        expect(graph.subgraphEdges("sg1")).to.deep.equal([e1]);
    });

    it("removeSubgraph with nested subgraphs (promoteChildren=false)", function () {
        const graph = createGraph();
        const sgOuter: MySubgraph = { id: "sgOuter" };
        const sgInner: MySubgraph = { id: "sgInner" };
        const v1: MyVertex = { id: "v1" };

        graph.addSubgraph(sgOuter);
        graph.addSubgraph(sgInner, sgOuter);
        graph.addVertex(v1, sgInner);

        graph.removeSubgraph("sgOuter", false);
        expect(graph.subgraphExists("sgOuter")).to.equal(false);
        expect(graph.subgraphExists("sgInner")).to.equal(false);
        // v1 survives because nested removeSubgraph defaults to promoteChildren=true,
        // promoting v1 to sgOuter before sgOuter is deleted from the map
        expect(graph.vertexExists("v1")).to.equal(true);
    });

    it("walk() visits all root-level items (no startID)", function () {
        const graph = createGraph();
        const sg: MySubgraph = { id: "sg1" };
        const v1: MyVertex = { id: "v1" };
        const v2: MyVertex = { id: "v2" };
        const v3: MyVertex = { id: "v3" };
        const e1: MyEdge = { id: "e1", from: "v2", to: "v3" };

        graph.addSubgraph(sg);
        graph.addVertex(v1, sg);   // inside sg1
        graph.addVertex(v2);       // root-level
        graph.addVertex(v3);       // root-level
        graph.addEdge(e1);         // root-level edge

        const visitedSubgraphs: string[] = [];
        const visitedVertices: string[] = [];
        const visitedEdges: string[] = [];

        const visitor = new Visitor<MyVertex, MyEdge, MySubgraph>();
        visitor.visitSubgraph = sg => visitedSubgraphs.push(sg.id);
        visitor.visitVertex = v => visitedVertices.push(v.id);
        visitor.visitEdge = e => visitedEdges.push(e.id);

        graph.walk(visitor);

        expect(visitedSubgraphs).to.deep.equal(["sg1"]);
        expect(visitedVertices).to.include("v1");   // child of sg1
        expect(visitedVertices).to.include("v2");   // root-level
        expect(visitedVertices).to.include("v3");   // root-level
        expect(visitedEdges).to.deep.equal(["e1"]);
    });

    it("walk() with startID visits subgraph and all descendants", function () {
        const graph = createGraph();
        const sgOuter: MySubgraph = { id: "sgOuter" };
        const sgInner: MySubgraph = { id: "sgInner" };
        const v1: MyVertex = { id: "v1" };
        const v2: MyVertex = { id: "v2" };
        const v3: MyVertex = { id: "v3" };

        graph.addSubgraph(sgOuter);
        graph.addSubgraph(sgInner, sgOuter);
        graph.addVertex(v1, sgOuter);
        graph.addVertex(v2, sgInner);
        graph.addVertex(v3);  // root-level, should NOT be visited

        const visitedSubgraphs: string[] = [];
        const visitedVertices: string[] = [];
        const visitor = new Visitor<MyVertex, MyEdge, MySubgraph>();
        visitor.visitSubgraph = sg => visitedSubgraphs.push(sg.id);
        visitor.visitVertex = v => visitedVertices.push(v.id);

        graph.walk(visitor, "sgOuter");

        expect(visitedSubgraphs).to.include("sgOuter");
        expect(visitedSubgraphs).to.include("sgInner");
        expect(visitedVertices).to.include("v1");
        expect(visitedVertices).to.include("v2");
        expect(visitedVertices).not.to.include("v3");
    });

    it("walk() with startID visits edges inside subgraph", function () {
        const graph = createGraph();
        const sg: MySubgraph = { id: "sg1" };
        const v1: MyVertex = { id: "v1" };
        const v2: MyVertex = { id: "v2" };
        const e1: MyEdge = { id: "e1", from: "v1", to: "v2" };

        graph.addSubgraph(sg);
        graph.addVertex(v1);
        graph.addVertex(v2);
        graph.addEdge(e1, sg);

        const visitedEdges: string[] = [];
        const visitor = new Visitor<MyVertex, MyEdge, MySubgraph>();
        visitor.visitEdge = e => visitedEdges.push(e.id);

        graph.walk(visitor, "sg1");
        expect(visitedEdges).to.deep.equal(["e1"]);
    });

    it("walk() with invalid startID throws", function () {
        const graph = createGraph();
        const visitor = new Visitor<MyVertex, MyEdge, MySubgraph>();
        expect(() => graph.walk(visitor, "nonexistent")).to.throw("does not exist");
    });
});

let v_id = 0;
function createVetex(): MyVertex {
    return {
        id: "id_" + v_id++
    };
}

function genData(vTotal = 70, eTotal = vTotal * 2) {
    const vertices: MyVertex[] = [];
    for (let i = 0; i < vTotal; ++i) {
        vertices.push(createVetex());
    }
    const edges: MyEdge[] = [];
    const dedupEdges: { [id: string]: boolean } = {};
    for (let i = 0; i < eTotal; ++i) {
        const v1 = vertices[Math.round((random() * 10))];
        const v2 = vertices[Math.round((random() * 10))];
        if (v1 && v2 && v1 !== v2) {
            const eID = `${v1.id}->${v2.id}`;
            if (dedupEdges[eID] !== true) {
                dedupEdges[eID] = true;
                edges.push({
                    id: eID,
                    from: v1.id,
                    to: v2.id
                });
            }
        }
    }
    return {
        vertices,
        edges
    };
}

let m_w = 123456789;
let m_z = 987654321;
const mask = 0xffffffff;

function random() {
    m_z = (36969 * (m_z & 65535) + (m_z >> 16)) & mask;
    m_w = (18000 * (m_w & 65535) + (m_w >> 16)) & mask;
    let result = ((m_z << 16) + (m_w & 65535)) >>> 0;
    result /= 4294967296;
    return result;
}


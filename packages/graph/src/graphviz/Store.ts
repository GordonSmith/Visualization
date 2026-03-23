import { type ID, Graph2, scopedLogger, } from "@hpcc-js/util";
import type { Node, Edge, Cluster, Graph } from "./types.ts";

const logger = scopedLogger("src/graphviz/Store.ts");

export class Store extends Graph2<Node, Edge, Cluster> {

    protected _graph: Graph = {};

    constructor() {
        super();
    }

    id(_: Node | Edge | Cluster): string {
        return _.id;
    }

    graph(): Graph;
    graph(_: Graph): this;
    graph(_?: Graph): Graph | this {
        if (arguments.length === 0) return this._graph;
        this._graph = _!;
        return this;
    }

    load(vertices: Node[], edges: Edge[], subgraphs: Cluster[] = [], graph: Graph = {}): this {
        this.clear();
        this._graph = graph;

        subgraphs.forEach((sg: Cluster) => {
            this.addSubgraph(sg);
        });

        subgraphs.forEach((sg: Cluster) => {
            if (sg.parentID) {
                this.subgraphParent(this.id(sg), this.parentID(sg)!);
            }
        });

        vertices.forEach((v: Node) => {
            if (v.parentID) {
                const sg = this.subgraph(this.parentID(v)!);
                this.addVertex(v, sg);
            } else {
                this.addVertex(v);
            }
        });

        edges.forEach((e: Edge) => {
            if (e.parentID) {
                const sg = this.subgraph(this.parentID(e)!);
                this.addEdge(e, sg);
            } else {
                this.addEdge(e);
            }
        });

        return this;
    }

    createView(selection: ID[]): Store {
        const view = new Store();
        view.graph(this._graph);
        const idSet = new Set(selection);

        const addSubgraphRecursive = (sgId: ID, parent?: Cluster) => {
            if (view.subgraphExists(sgId)) return;
            const sg = this.subgraph(sgId);
            view.addSubgraph(sg, parent);

            for (const child of this.subgraphSubgraphs(sgId)) {
                addSubgraphRecursive(this.id(child), sg);
            }
            for (const v of this.subgraphVertices(sgId)) {
                view.addVertex(v, sg);
            }
            for (const e of this.subgraphEdges(sgId)) {
                view.addEdge(e, sg);
            }
        };

        for (const id of selection) {
            if (this.subgraphExists(id)) {
                addSubgraphRecursive(id);
            } else {
                const item = this.item(id);
                if (item?.parentID && this.subgraphExists(this.parentID(item)!)) {
                    addSubgraphRecursive(this.parentID(item)!);
                }
            }
        }

        for (const edge of this.allEdges()) {
            if (view.edgeExists(this.id(edge))) continue;
            const sourceVertex = this.vertex(this.sourceID(edge));
            const targetVertex = this.vertex(this.targetID(edge));
            if (sourceVertex && targetVertex) {
                const sourceParentId = this.parentID(sourceVertex);
                const targetParentId = this.parentID(targetVertex);
                if (sourceParentId && targetParentId &&
                    idSet.has(sourceParentId) &&
                    idSet.has(targetParentId)) {
                    view.addEdge(edge);
                }
            }
        }

        return view;
    }
}
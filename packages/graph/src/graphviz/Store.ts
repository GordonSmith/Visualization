import { Graph2, scopedLogger, } from "@hpcc-js/util";
import type { Vertex, Edge, Subgraph, Graph } from "./types.ts";

const logger = scopedLogger("src/graphviz/Store.ts");

export class Store extends Graph2<Vertex, Edge, Subgraph> {

    protected _graph: Graph = {};

    constructor() {
        super();
    }

    graph(): Graph;
    graph(_: Graph): this;
    graph(_?: Graph): Graph | this {
        if (arguments.length === 0) return this._graph;
        this._graph = _!;
        return this;
    }

    load(vertices: Vertex[], edges: Edge[], subgraphs: Subgraph[] = [], graph: Graph = {}): this {
        this.clear();
        this._graph = graph;

        subgraphs.forEach((sg: Subgraph) => {
            this.addSubgraph(sg);
        });

        subgraphs.forEach((sg: Subgraph) => {
            if (sg.parentID) {
                this.subgraphParent(this.id(sg), this.parentID(sg)!);
            }
        });

        vertices.forEach((v: Vertex) => {
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
}
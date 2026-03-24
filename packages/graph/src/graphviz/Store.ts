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

    createView(selection: ID[]): this {
        const view = super.createView(selection);
        view.graph(this._graph);
        return view;
    }
}
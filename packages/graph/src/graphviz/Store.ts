import { HierarchicalGraph, scopedLogger, } from "@hpcc-js/util";
import type { Node, Edge, Cluster, Graph } from "./types.ts";

const logger = scopedLogger("src/graphviz/Store.ts");

function requireById<T extends { id: string }>(map: Map<string, T>, id: string, type: string): T {
    const item = map.get(id);
    if (!item) {
        throw new Error(`Unknown ${type} ID: ${id}`);
    }
    return item;
}

function indexById<T extends { id: string }>(items: T[], type: string): Map<string, T> {
    const map = new Map<string, T>();
    for (const item of items) {
        if (map.has(item.id)) {
            throw new Error(`Duplicate ${type} ID: ${item.id}`);
        }
        map.set(item.id, item);
    }
    return map;
}

export class Store extends HierarchicalGraph<Node, Edge, Cluster> {

    protected _graph: Graph = {};

    constructor() {
        super();
    }

    id(_: Node | Edge | Cluster): string {
        return _.id;
    }

    sourceID(e: Edge): string {
        return e.sourceID as string;
    }

    targetID(e: Edge): string {
        return e.targetID as string;
    }

    subgraphs(): Cluster[] {
        return super.subgraphs().filter(sg => sg !== this.rootSubgraph());
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

        const subgraphMap = indexById(subgraphs, "subgraph");
        const vertexMap = indexById(vertices, "vertex");

        subgraphs.forEach((sg: Cluster) => {
            this.addSubgraph(sg);
        });

        subgraphs.forEach((sg: Cluster) => {
            if (sg.parentID) {
                this.setParent(sg, requireById(subgraphMap, sg.parentID, "parent subgraph"));
            }
        });

        vertices.forEach((v: Node) => {
            const parent = v.parentID ? requireById(subgraphMap, v.parentID, "parent subgraph") : undefined;
            this.addVertex(v, parent);
        });

        edges.forEach((e: Edge) => {
            const source = requireById(vertexMap, e.sourceID, "source vertex");
            const target = requireById(vertexMap, e.targetID, "target vertex");
            this.addEdge(source, target, e);
        });

        return this;
    }

    private addSubgraphAncestors(view: Store, sg: Cluster): void {
        if (view.hasSubgraph(sg)) return;
        const parent = this.parentSubgraph(sg);
        if (parent && parent !== this.rootSubgraph()) {
            this.addSubgraphAncestors(view, parent);
            view.addSubgraph(sg, parent);
        } else {
            view.addSubgraph(sg);
        }
    }

    private addSubgraphTree(view: Store, sg: Cluster): void {
        this.addSubgraphAncestors(view, sg);
        for (const child of this.subgraphSubgraphs(sg)) {
            this.addSubgraphTree(view, child);
        }
        for (const vertex of this.subgraphVertices(sg)) {
            if (!view.hasVertex(vertex)) {
                view.addVertex(vertex, sg);
            }
        }
    }

    private addVertexWithAncestors(view: Store, vertex: Node): void {
        if (view.hasVertex(vertex)) return;
        const parent = this.parentSubgraph(vertex);
        if (parent && parent !== this.rootSubgraph()) {
            this.addSubgraphAncestors(view, parent);
            view.addVertex(vertex, parent);
        } else {
            view.addVertex(vertex);
        }
    }

    createView(selection: string[]): this {
        const view = new (Object.getPrototypeOf(this).constructor)() as Store;

        const subgraphMap = new Map<string, Cluster>();
        for (const sg of this.subgraphs()) {
            subgraphMap.set(sg.id, sg);
        }
        const vertexMap = new Map<string, Node>();
        for (const v of this.vertices()) {
            vertexMap.set(v.id, v);
        }

        for (const id of selection) {
            const strId = String(id);
            const sg = subgraphMap.get(strId);
            if (sg) {
                this.addSubgraphTree(view, sg);
            } else {
                const v = vertexMap.get(strId);
                if (v) {
                    this.addVertexWithAncestors(view, v);
                }
            }
        }

        for (const edge of this.edges()) {
            if (view.hasEdge(edge)) continue;
            const source = this.source(edge);
            const target = this.target(edge);
            if (view.hasVertex(source) && view.hasVertex(target)) {
                view.addEdge(source, target, edge);
            }
        }

        view.graph(this._graph);
        return view as this;
    }
}
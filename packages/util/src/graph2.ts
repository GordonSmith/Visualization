import { compare2 } from "./array";

class GraphItem<T = any> {
    protected _graph: Graph2;
    _: T;
    id(): string {
        return this._graph.id(this._);
    }

    constructor(g: Graph2, _: T) {
        this._graph = g;
        this._ = _;
    }
}

class ChildGraphItem<S = any> extends GraphItem<S> {

    private _parent: Subgraph | undefined;

    constructor(g: Graph2, _: S) {
        super(g, _);
    }

    clearParent(): this {
        if (this._parent) {
            this._parent.removeChild(this);
            delete this._parent;
        }
        return this;
    }

    parent(): Subgraph | undefined;
    parent(_: Subgraph | undefined): this;
    parent(_?: Subgraph): Subgraph | undefined | this {
        if (arguments.length === 0) return this._parent;
        if (this._parent !== _) {
            if (this._parent) {
                this._parent.removeChild(this);
            }
            this._parent = _;
            if (this._parent) {
                this._parent.addChild(this);
            }
        }
        return this;
    }
}

class Subgraph<S = any> extends ChildGraphItem<S> {

    private _children: ChildGraphItem[] = [];

    constructor(g: Graph2, _: S) {
        super(g, _);
    }

    children(): ChildGraphItem[] {
        return this._children;
    }

    addChild(_: ChildGraphItem) {
        this._children.push(_);
    }

    removeChild(_: ChildGraphItem) {
        this._children = this._children.filter(row => row.id !== _.id);
    }
}

class Vertex<V = any> extends ChildGraphItem<V> {

    private _inEdges: Edge[] = [];
    private _outEdges: Edge[] = [];

    constructor(g: Graph2, _: V) {
        super(g, _);
    }

    edges() {
        return [...this._inEdges, ...this._outEdges];
    }

    edgeCount() {
        return this._outEdges.length + this._inEdges.length;
    }

    inEdges() {
        return this._inEdges;
    }

    addInEdge(e: Edge) {
        this._inEdges.push(e);
    }

    removeInEdge(id: string) {
        this._outEdges = this._outEdges.filter(e => e._.id !== id);
    }

    outEdges() {
        return this._outEdges;
    }

    addOutEdge(e: Edge) {
        this._outEdges.push(e);
    }

    removeOutEdge(id: string) {
        this._outEdges = this._outEdges.filter(e => e._.id !== id);
    }
}

class Edge<E = any> extends GraphItem<E> {

    _source: Vertex;
    _target: Vertex;

    constructor(g: Graph2, _: E, source: Vertex, target: Vertex) {
        super(g, _);
        this._source = source;
        this._target = target;
    }
}

type SubgraphMap<T> = { [id: string]: Subgraph<T> };
type VertexMap<T> = { [id: string]: Vertex<T> };
type EdgeMap<T> = { [id: string]: Edge<T> };

export type HierarchyFormatter<V, S> = (type: "subgraph" | "vertex", item: V | S, children?: object[]) => object;

export class Graph2<V = any, E = any, S = any> {

    private _directed: boolean;
    private _subgraphMap: SubgraphMap<S> = {};
    private _vertexMap: VertexMap<V> = {};
    private _edgeMap: EdgeMap<E> = {};

    constructor(directed = true) {
        this._directed = directed;
    }

    clear(): this {
        this._subgraphMap = {};
        this._vertexMap = {};
        this._edgeMap = {};
        return this;
    }

    clearParents(): this {
        for (const key in this._subgraphMap) {
            this._subgraphMap[key].clearParent();
        }
        for (const key in this._vertexMap) {
            this._vertexMap[key].clearParent();
        }
        return this;
    }

    isDirected(): boolean {
        return this._directed;
    }

    _idFunc = (_: any): string => typeof _.id === "function" ? _.id() : _.id;
    idFunc(_: (_: S | V | E) => string): this {
        this._idFunc = _;
        return this;
    }

    _sourceFunc = (_: any): string => typeof _.source === "function" ? _.source() : _.source;
    sourceFunc(_: (_: E) => string): this {
        this._sourceFunc = _;
        return this;
    }

    _targetFunc = (_: any): string => typeof _.target === "function" ? _.target() : _.target;
    targetFunc(_: (_: E) => string): this {
        this._targetFunc = _;
        return this;
    }

    _updateFunc = (before: S | V | E, after: S | V | E): S | V | E => after;
    updateFunc(_: (before: S | V | E, after: S | V | E) => S | V | E): this {
        this._updateFunc = _;
        return this;
    }

    id(_: S | V | E): string {
        return this._idFunc(_);
    }

    type(id: string): "S" | "V" | "E" | "" {
        if (this.subgraphExists(id)) return "S";
        if (this.vertexExists(id)) return "V";
        if (this.edgeExists(id)) return "E";
        return "";
    }

    isSubgraph(_: S | V | E): _ is S {
        return this.subgraphExists(this.id(_));
    }

    isVertex(_: S | V | E): _ is V {
        return this.vertexExists(this.id(_));
    }

    isEdge(_: S | V | E): _ is E {
        return this.edgeExists(this.id(_));
    }

    item(id: string): S | V | E | undefined {
        if (this.subgraphExists(id)) return this.subgraph(id);
        if (this.vertexExists(id)) return this.vertex(id);
        if (this.edgeExists(id)) return this.edge(id);
        return undefined;
    }

    // Subgraphs  ---
    subgraphs(): S[] {
        const retVal: S[] = [];
        for (const key in this._subgraphMap) {
            retVal.push(this._subgraphMap[key]._);
        }
        return retVal;
    }

    subgraphExists(id: string): boolean {
        return !!this._subgraphMap[id];
    }

    subgraph(id: string): S {
        return this._subgraphMap[id]._;
    }

    addSubgraph(s: S, parent?: S): this {
        const s_id = this._idFunc(s);
        if (this._subgraphMap[s_id]) throw new Error(`Subgraph '${s_id}' already exists.`);
        const subgraph = new Subgraph(this, s);
        if (parent) {
            const p_id = this._idFunc(parent);
            if (!this._subgraphMap[p_id]) throw new Error(`Subgraph '${p_id}' does not exist.`);
            subgraph.parent(this._subgraphMap[p_id]);
        }
        this._subgraphMap[s_id] = subgraph;
        return this;
    }

    mergeSubgraphs(_subgraphs: S[] = []): this {
        const sgDiff = compare2<S>(this.subgraphs(), _subgraphs, sg => this._idFunc(sg), this._updateFunc as any);
        sgDiff.exit.forEach(sg => this.removeSubgraph(this._idFunc(sg)));
        sgDiff.enter.forEach(sg => this.addSubgraph(sg));
        sgDiff.update.forEach(sg => this.updateSubgraph(sg));
        return this;
    }

    updateSubgraph(sg: S): this {
        const sg_id = this._idFunc(sg);
        const subgraph = this._subgraphMap[sg_id];
        if (!subgraph) throw new Error(`Subgraph '${sg_id}' does not exist.`);
        subgraph._ = sg;
        return this;
    }

    removeSubgraph(id: string, promoteChildren = true): this {
        const sg = this._subgraphMap[id];
        if (!sg) throw new Error(`Subgraph '${id}' does not exist.`);
        sg.children().forEach(child => {
            if (promoteChildren) {
                child.parent(sg.parent());
            } else {
                if (child instanceof Subgraph) {
                    this.removeSubgraph(child.id());
                } else {
                    this.removeVertex(child.id());
                }
            }
        });
        delete this._subgraphMap[id];
        return this;
    }

    subgraphParent(id: string): S | undefined;
    subgraphParent(id: string, parentID: string): this;
    subgraphParent(id: string, parentID?: string): S | undefined | this {
        const item = this._subgraphMap[id];
        if (!item) throw new Error(`Subgraph '${id}' does not exist.`);
        if (parentID === void 0) {
            const parent = item.parent();
            return parent ? parent._ as S : undefined;
        }
        const parent = this._subgraphMap[parentID];
        if (!parent) throw new Error(`Vertex parent '${parent}' does not exist.`);
        item.parent(parent);
        return this;
    }

    // Vertices  ---
    vertices(): V[] {
        const retVal: V[] = [];
        for (const key in this._vertexMap) {
            retVal.push(this._vertexMap[key]._);
        }
        return retVal;
    }

    vertexExists(id: string): boolean {
        return !!this._vertexMap[id];
    }

    vertex(id: string): V {
        return this._vertexMap[id]._;
    }

    edges(vertexID?: string): E[] {
        if (vertexID) {
            return this._vertexMap[vertexID].edges().map(e => e._);
        }
        const retVal: E[] = [];
        for (const key in this._edgeMap) {
            retVal.push(this._edgeMap[key]._);
        }
        return retVal;
    }

    inEdges(vertexID: string): E[] {
        return this._vertexMap[vertexID].inEdges().map(e => e._);
    }

    outEdges(vertexID: string): E[] {
        return this._vertexMap[vertexID].outEdges().map(e => e._);
    }

    private _neighbors(id: string): Vertex[] {
        return [...this._vertexMap[id].outEdges().map(e => e._target), ...this._vertexMap[id].inEdges().map(e => e._source)];
    }

    neighbors(id: string): V[] {
        return this._neighbors(id).map(n => n._);
    }

    singleNeighbors(id: string): V[] {
        return this._neighbors(id).filter(n => n.edgeCount() === 1).map(n => n._);
    }

    addVertex(v: V, parent?: S): this {
        const v_id = this._idFunc(v);
        if (this._vertexMap[v_id]) throw new Error(`Vertex '${v_id}' already exists.`);
        const vertex = new Vertex(this, v);
        if (parent) {
            const p_id = this._idFunc(parent);
            if (!this.subgraphExists(p_id)) throw new Error(`Subgraph '${p_id}' does not exist.`);
            vertex.parent(this._subgraphMap[p_id]);
        }
        this._vertexMap[v_id] = vertex;
        return this;
    }

    mergeVertices(_vertices: V[]): this {
        const vDiff = compare2(this.vertices(), _vertices, v => this._idFunc(v), this._updateFunc as any);
        vDiff.exit.forEach(v => this.removeVertex(this._idFunc(v)));
        vDiff.enter.forEach(v => this.addVertex(v));
        vDiff.update.forEach(v => this.updateVertex(v));
        return this;
    }

    updateVertex(v: V): this {
        const v_id = this._idFunc(v);
        const vertex = this._vertexMap[v_id];
        if (!vertex) throw new Error(`Vertex '${v_id}' does not exist.`);
        vertex._ = v;
        return this;
    }

    removeVertex(id: string): this {
        const v = this._vertexMap[id];
        if (!v) throw new Error(`Vertex '${id}' does not exist.`);
        v.edges().forEach(e => {
            this.removeEdge(e.id());
        });
        delete this._vertexMap[id];
        return this;
    }

    vertexParent(id: string): S | undefined;
    vertexParent(id: string, parentID: string): this;
    vertexParent(id: string, parentID?: string): S | undefined | this {
        const item = this._vertexMap[id];
        if (!item) throw new Error(`Vertex '${id}' does not exist.`);
        if (parentID === void 0) {
            const parent = item.parent();
            return parent ? parent._ as S : undefined;
        }
        const parent = this._subgraphMap[parentID];
        if (!parent) throw new Error(`Vertex parent '${parent}' does not exist.`);
        item.parent(parent);
        return this;
    }

    // Edges  ---
    edgeExists(id: string): boolean {
        return !!this._edgeMap[id];
    }

    edge(id: string): E {
        return this._edgeMap[id]._;
    }

    addEdge(e: E): this {
        const e_id = this._idFunc(e);
        const e_source = this._sourceFunc(e);
        const e_target = this._targetFunc(e);
        if (this._edgeMap[e_id]) throw new Error(`Edge '${e_id}' already exists.`);
        if (!this.vertexExists(e_source)) throw new Error(`Edge Source '${e_source}' does not exist.`);
        if (!this.vertexExists(e_target)) throw new Error(`Edge Target '${e_target}' does not exist.`);
        const edge = new Edge(this, e, this._vertexMap[e_source], this._vertexMap[e_target]);
        this._edgeMap[e_id] = edge;
        this._vertexMap[e_source].addOutEdge(edge);
        this._vertexMap[e_target].addInEdge(edge);
        return this;
    }

    mergeEdges(_edges: E[]): this {
        const eDiff = compare2(this.edges(), _edges, e => this._idFunc(e), this._updateFunc as any);
        eDiff.exit.forEach(e => this.removeEdge(this._idFunc(e)));
        eDiff.enter.forEach(e => this.addEdge(e));
        eDiff.update.forEach(e => this.updateEdge(e));
        return this;
    }

    updateEdge(e: E): this {
        const e_id = this._idFunc(e);
        const edge = this._edgeMap[e_id];
        if (!edge) throw new Error(`Edge '${e_id}' does not exist.`);
        edge._ = e;
        return this;
    }

    removeEdge(id: string): this {
        const e: Edge<E> = this._edgeMap[id];
        if (!e) throw new Error(`Edge '${id}' does not exist.`);

        const e_sourceID = this._idFunc(e._source._);
        if (!this.vertexExists(e_sourceID)) throw new Error(`Edge Source'${e_sourceID}' does not exist.`);
        this._vertexMap[e_sourceID].removeOutEdge(id);

        const e_targetID = this._idFunc(e._target._);
        if (!this.vertexExists(e_targetID)) throw new Error(`Edge Target'${e_targetID}' does not exist.`);
        this._vertexMap[e_targetID].removeInEdge(id);

        delete this._edgeMap[id];
        return this;
    }

    protected _hwalk(item: Subgraph<S> | Vertex<V>, formatter: HierarchyFormatter<V, S>): object {
        if (item instanceof Subgraph) {
            return formatter("subgraph", item._, item.children().map(child => this._hwalk(child as Subgraph<S> | Vertex<V>, formatter)));
        } else {
            return formatter("vertex", item._);
        }
    }

    hierarchy(formatter: HierarchyFormatter<V, S>): object[] {
        const retVal: object[] = [];
        for (const id in this._subgraphMap) {
            const sg = this._subgraphMap[id];
            if (sg.parent() === undefined) {
                retVal.push(this._hwalk(sg, formatter));
            }
        }
        for (const id in this._vertexMap) {
            const v = this._vertexMap[id];
            if (v.parent() === undefined) {
                retVal.push(this._hwalk(v, formatter));
            }
        }
        return retVal;
    }

    dijkstra(source: string, target: string): { ids: string[], len: number } {
        const edges = this.edges();
        const Q = new Set<string>();
        const prev: { [key: string]: string } = {};
        const dist: { [key: string]: number } = {};
        const adj: { [key: string]: { [key: string]: number } } = {};

        function vertex_with_min_dist(Q: Set<string>, dist: { [key: string]: number }) {
            let min_distance = Infinity;
            let u: string | null = null;

            Q.forEach(v => {
                if (dist[v] < min_distance) {
                    min_distance = dist[v];
                    u = v;
                }
            });
            return u;
        }

        for (let i = 0; i < edges.length; i++) {
            const v1 = this._sourceFunc(edges[i]);
            const v2 = this._targetFunc(edges[i]);
            const len = 1;

            Q.add(v1);
            Q.add(v2);

            dist[v1] = Infinity;
            dist[v2] = Infinity;

            if (adj[v1] === undefined) adj[v1] = {};
            if (adj[v2] === undefined) adj[v2] = {};

            adj[v1][v2] = len;
            adj[v2][v1] = len;
        }

        dist[source] = 0;

        while (Q.size) {
            const u = vertex_with_min_dist(Q, dist);
            if (u === null) break;
            const neighbors = Object.keys(adj[u]).filter(v => Q.has(v)); // Neighbor still in Q

            Q.delete(u);

            if (u === target) break; // Break when the target has been found

            for (const v of neighbors) {
                const alt = dist[u] + adj[u][v];
                if (alt < dist[v]) {
                    dist[v] = alt;
                    prev[v] = u;
                }
            }
        }

        let u = target;
        const ids = [u];
        let len = 0;

        while (prev[u] !== undefined) {
            ids.unshift(prev[u]);
            len += adj[u][prev[u]];
            u = prev[u];
        }
        return { ids, len };
    }
}

class Set<T> {

    private _content: T[] = [];
    get size(): number {
        return this._content.length;
    }

    has(_: T) {
        return this._content.indexOf(_) >= 0;
    }

    add(_: T) {
        if (!this.has(_)) {
            this._content.push(_);
        }
    }

    delete(_: T) {
        const idx = this._content.indexOf(_);
        if (idx >= 0) {
            this._content.splice(idx, 1);
        }
    }

    forEach(_: (value: T, index: number, array: T[]) => void) {
        this._content.forEach(_);
    }
}

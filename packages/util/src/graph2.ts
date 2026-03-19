import { compare2 } from "./array.ts";

export type ID = string | number;

export interface GraphItemT {
    id?: ID | (() => ID);
}

export interface ChildGraphItemT extends GraphItemT {
    parent?: ID | (() => ID);
}

export interface VertexT extends ChildGraphItemT {
}

export interface EdgeT extends ChildGraphItemT {
    sourceID?: ID | (() => ID);
    targetID?: ID | (() => ID);
}

export interface SubgraphT extends ChildGraphItemT {
}

class Placeholder<T extends GraphItemT = object> {
    protected _graph: Graph2;
    _: T;
    id(): ID {
        return this._graph.id(this._);
    }

    constructor(g: Graph2, _: T) {
        this._graph = g;
        this._ = _;
    }
}

class ChildPlaceholder<T extends GraphItemT = object> extends Placeholder<T> {

    private _parent: SubgraphPlaceholder | undefined;

    constructor(g: Graph2, _: T) {
        super(g, _);
    }

    clearParent(): this {
        if (this._parent) {
            this._parent.removeChild(this);
            delete this._parent;
        }
        return this;
    }

    parent(): SubgraphPlaceholder | undefined;
    parent(_: SubgraphPlaceholder | undefined): this;
    parent(_?: SubgraphPlaceholder): SubgraphPlaceholder | undefined | this {
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

class SubgraphPlaceholder<S extends SubgraphT = object> extends ChildPlaceholder<S> {

    private _children: ChildPlaceholder[] = [];

    constructor(g: Graph2, _: S) {
        super(g, _);
    }

    children(): ChildPlaceholder[] {
        return this._children;
    }

    addChild(_: ChildPlaceholder) {
        this._children.push(_);
    }

    removeChild(_: ChildPlaceholder) {
        const id = _.id();
        this._children = this._children.filter(row => row.id() !== id);
    }
}

class VertexPlaceholder<V extends VertexT = object> extends ChildPlaceholder<V> {

    private _inEdges: EdgePlaceholder[] = [];
    private _outEdges: EdgePlaceholder[] = [];

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

    addInEdge(e: EdgePlaceholder) {
        this._inEdges.push(e);
    }

    removeInEdge(id: ID) {
        this._inEdges = this._inEdges.filter(e => e.id() !== id);
    }

    outEdges() {
        return this._outEdges;
    }

    addOutEdge(e: EdgePlaceholder) {
        this._outEdges.push(e);
    }

    removeOutEdge(id: ID) {
        this._outEdges = this._outEdges.filter(e => e.id() !== id);
    }
}

class EdgePlaceholder<E extends EdgeT = object> extends ChildPlaceholder<E> {

    _source: VertexPlaceholder;
    _target: VertexPlaceholder;

    constructor(g: Graph2, _: E, source: VertexPlaceholder, target: VertexPlaceholder) {
        super(g, _);
        this._source = source;
        this._target = target;
    }
}

type SubgraphMap<T extends SubgraphT> = { [id: string]: SubgraphPlaceholder<T> };
type VertexMap<T extends VertexT> = { [id: string]: VertexPlaceholder<T> };
type EdgeMap<T extends EdgeT> = { [id: string]: EdgePlaceholder<T> };

export type HierarchyFormatter<V, S> = (type: "subgraph" | "vertex", item: V | S, children?: object[]) => object;

export class Visitor<V extends VertexT = object, E extends EdgeT = object, S extends SubgraphT = object> {
    visitSubgraph(subgraph: S) { };
    visitVertex(vertex: V) { };
    visitEdge(edge: E) { };
}

export class Graph2<V extends VertexT = object, E extends EdgeT = object, S extends SubgraphT = object> {

    private _directed: boolean;
    private _subgraphMap: SubgraphMap<S> = {};
    private _vertexMap: VertexMap<V> = {};
    private _edgeMap: EdgeMap<E> = {};

    private _edgeParentMap: { [id: string]: S } = {};

    constructor(directed = true) {
        this._directed = directed;
    }

    clear(): this {
        this._subgraphMap = {};
        this._vertexMap = {};
        this._edgeMap = {};
        this._edgeParentMap = {};
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

    _idFunc = (_: any): ID => typeof _.id === "function" ? _.id() : _.id;
    idFunc(_: (_: S | V | E) => ID): this {
        this._idFunc = _;
        return this;
    }

    _sourceFunc = (_: any): ID => typeof _.source === "function" ? _.source() : _.source;
    sourceFunc(_: (_: E) => ID): this {
        this._sourceFunc = _;
        return this;
    }

    _targetFunc = (_: any): ID => typeof _.target === "function" ? _.target() : _.target;
    targetFunc(_: (_: E) => ID): this {
        this._targetFunc = _;
        return this;
    }

    _updateFunc = (before: S | V | E, after: S | V | E): S | V | E => after;
    updateFunc(_: (before: S | V | E, after: S | V | E) => S | V | E): this {
        this._updateFunc = _;
        return this;
    }

    id(_: S | V | E): ID {
        return this._idFunc(_);
    }

    type(id: ID): "S" | "V" | "E" | "" {
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

    allItems(): Array<S | V | E> {
        return [...this.allSubgraphs(), ...this.allVertices(), ...this.allEdges()];
    }

    item(id: ID): S | V | E | undefined {
        if (this.subgraphExists(id)) return this.subgraph(id);
        if (this.vertexExists(id)) return this.vertex(id);
        if (this.edgeExists(id)) return this.edge(id);
        return undefined;
    }

    itemExists(id: ID): boolean {
        return this.edgeExists(id) || this.vertexExists(id) || this.subgraphExists(id);
    }

    itemParent(id: string | number): S | undefined {
        if (this.vertexExists(id)) {
            return this.vertexParent(id);
        } else if (this.subgraphExists(id)) {
            return this.subgraphParent(id);
        } else if (this.edgeExists(id)) {
            return this._edgeParentMap[id];
        }
        return undefined;
    }

    // Subgraphs  ---
    allSubgraphs(): S[] {
        const retVal: S[] = [];
        for (const key in this._subgraphMap) {
            retVal.push(this._subgraphMap[key]._);
        }
        return retVal;
    }

    subgraphs(): S[] {
        const retVal: S[] = [];
        for (const key in this._subgraphMap) {
            if (this._subgraphMap[key].parent() === undefined) {
                retVal.push(this._subgraphMap[key]._);
            }
        }
        return retVal;
    }

    subgraphExists(id: ID): boolean {
        return !!this._subgraphMap[id];
    }

    subgraph(id: ID): S {
        return this._subgraphMap[id]._;
    }

    subgraphSubgraphs(id: ID): S[] {
        return this._subgraphMap[id].children().filter(child => this.isSubgraph(child._ as S | V | E)).map(child => child._ as S);
    }

    subgraphVertices(id: ID): V[] {
        return this._subgraphMap[id].children().filter(child => this.isVertex(child._ as S | V | E)).map(child => child._ as V);
    }

    subgraphEdges(id: ID): E[] {
        return this._subgraphMap[id].children().filter(child => this.isEdge(child._ as S | V | E)).map(child => child._ as E);
    }

    addSubgraph(s: S, parent?: S): this {
        const s_id = this._idFunc(s);
        if (this._subgraphMap[s_id]) throw new Error(`Subgraph '${s_id}' already exists.`);
        const subgraph = new SubgraphPlaceholder(this as unknown as Graph2, s);
        if (parent) {
            const p_id = this._idFunc(parent);
            if (!this._subgraphMap[p_id]) throw new Error(`Subgraph '${p_id}' does not exist.`);
            subgraph.parent(this._subgraphMap[p_id]);
        }
        this._subgraphMap[s_id] = subgraph;
        return this;
    }

    mergeSubgraphs(_subgraphs: S[] = []): this {
        const sgDiff = compare2<S>(this.allSubgraphs(), _subgraphs, sg => this._idFunc(sg), this._updateFunc as any);
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

    removeSubgraph(id: ID, promoteChildren = true): this {
        const sg = this._subgraphMap[id];
        if (!sg) throw new Error(`Subgraph '${id}' does not exist.`);
        sg.children().forEach(child => {
            if (promoteChildren) {
                child.parent(sg.parent());
            } else {
                if (child instanceof SubgraphPlaceholder) {
                    this.removeSubgraph(child.id());
                } else {
                    this.removeVertex(child.id());
                }
            }
        });
        sg.clearParent();
        delete this._subgraphMap[id];
        return this;
    }

    subgraphParent(id: ID): S | undefined;
    subgraphParent(id: ID, parentID: ID): this;
    subgraphParent(id: ID, parentID?: ID): S | undefined | this {
        const item = this._subgraphMap[id];
        if (!item) throw new Error(`Subgraph '${id}' does not exist.`);
        if (parentID === void 0) {
            const parent = item.parent();
            return parent ? parent._ as S : undefined;
        }
        const parent = this._subgraphMap[parentID];
        if (!parent) throw new Error(`Subgraph parent '${parentID}' does not exist.`);
        item.parent(parent);
        return this;
    }

    // Vertices  ---
    allVertices(): V[] {
        const retVal: V[] = [];
        for (const key in this._vertexMap) {
            retVal.push(this._vertexMap[key]._);
        }
        return retVal;
    }

    vertices(): V[] {
        const retVal: V[] = [];
        for (const key in this._vertexMap) {
            if (this._vertexMap[key].parent() === undefined) {
                retVal.push(this._vertexMap[key]._);
            }
        }
        return retVal;
    }

    vertexExists(id: ID): boolean {
        return !!this._vertexMap[id];
    }

    vertex(id: ID): V {
        return this._vertexMap[id]._;
    }

    allEdges(): E[] {
        const retVal: E[] = [];
        for (const key in this._edgeMap) {
            retVal.push(this._edgeMap[key]._);
        }
        return retVal;
    }

    edges(): E[] {
        const retVal: E[] = [];
        for (const key in this._edgeMap) {
            if (this._edgeMap[key].parent() === undefined) {
                retVal.push(this._edgeMap[key]._);
            }
        }
        return retVal;
    }

    vertexEdges(vertexID: ID): E[] {
        return this._vertexMap[vertexID].edges().map(e => e._ as E);
    }

    inEdges(vertexID: ID): E[] {
        return this._vertexMap[vertexID].inEdges().map(e => e._ as E);
    }

    outEdges(vertexID: ID): E[] {
        return this._vertexMap[vertexID].outEdges().map(e => e._ as E);
    }

    internalOutEdges(vertexID: ID): E[] {
        const vParent = this.vertexParent(vertexID);
        const vParentId = vParent !== undefined ? this.id(vParent) : undefined;
        return this.outEdges(vertexID).filter(e => {
            const targetId = this._targetFunc(e);
            if (!this.vertexExists(targetId)) return false;
            const targetParent = this.vertexParent(targetId);
            const targetParentId = targetParent !== undefined ? this.id(targetParent) : undefined;
            return vParentId === targetParentId;
        });
    }

    private _neighbors(id: ID): VertexPlaceholder<V>[] {
        return [...this._vertexMap[id].outEdges().map(e => e._target as VertexPlaceholder<V>), ...this._vertexMap[id].inEdges().map(e => e._source as VertexPlaceholder<V>)];
    }

    neighbors(id: ID): V[] {
        return this._neighbors(id).map(n => n._);
    }

    singleNeighbors(id: ID): V[] {
        return this._neighbors(id).filter(n => n.edgeCount() === 1).map(n => n._);
    }

    addVertex(v: V, parent?: S): this {
        const v_id = this._idFunc(v);
        if (this._vertexMap[v_id]) throw new Error(`Vertex '${v_id}' already exists.`);
        const vertex = new VertexPlaceholder(this as unknown as Graph2, v);
        if (parent) {
            const p_id = this._idFunc(parent);
            if (!this.subgraphExists(p_id)) throw new Error(`Subgraph '${p_id}' does not exist.`);
            vertex.parent(this._subgraphMap[p_id]);
        }
        this._vertexMap[v_id] = vertex;
        return this;
    }

    mergeVertices(_vertices: V[]): this {
        const vDiff = compare2(this.allVertices(), _vertices, v => this._idFunc(v), this._updateFunc as any);
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

    removeVertex(id: ID): this {
        const v = this._vertexMap[id];
        if (!v) throw new Error(`Vertex '${id}' does not exist.`);
        v.edges().forEach(e => {
            this.removeEdge(e.id());
        });
        v.clearParent();
        delete this._vertexMap[id];
        return this;
    }

    vertexParent(id: ID): S | undefined;
    vertexParent(id: ID, parentID: ID): this;
    vertexParent(id: ID, parentID?: ID): S | undefined | this {
        const item = this._vertexMap[id];
        if (!item) throw new Error(`Vertex '${id}' does not exist.`);
        if (parentID === void 0) {
            const parent = item.parent();
            return parent ? parent._ as S : undefined;
        }
        const parent = this._subgraphMap[parentID];
        if (!parent) throw new Error(`Vertex parent '${parentID}' does not exist.`);
        item.parent(parent);
        return this;
    }

    findFirstVertex(subgraphOrVertexID: ID): V | undefined {
        if (this.vertexExists(subgraphOrVertexID)) {
            return this.vertex(subgraphOrVertexID);
        }
        if (this.subgraphExists(subgraphOrVertexID)) {
            const vertices = this.subgraphVertices(subgraphOrVertexID);
            if (vertices.length > 0) return vertices[0];
            for (const child of this.subgraphSubgraphs(subgraphOrVertexID)) {
                const result = this.findFirstVertex(this.id(child));
                if (result !== undefined) return result;
            }
        }
        return undefined;
    }

    // Edges  ---
    edgeExists(id: ID): boolean {
        return !!this._edgeMap[id];
    }

    edge(id: ID): E {
        return this._edgeMap[id]._;
    }

    addEdge(e: E, parent?: S): this {
        const e_id = this._idFunc(e);
        const e_source = this._sourceFunc(e);
        const e_target = this._targetFunc(e);
        if (this._edgeMap[e_id]) throw new Error(`Edge '${e_id}' already exists.`);
        if (!this.vertexExists(e_source)) throw new Error(`Edge Source '${e_source}' does not exist.`);
        if (!this.vertexExists(e_target)) throw new Error(`Edge Target '${e_target}' does not exist.`);
        const edge = new EdgePlaceholder(this as unknown as Graph2, e, this._vertexMap[e_source], this._vertexMap[e_target]);
        if (parent) {
            const p_id = this._idFunc(parent);
            if (!this.subgraphExists(p_id)) throw new Error(`Subgraph '${p_id}' does not exist.`);
            this._edgeParentMap[this._idFunc(e)] = parent;
            edge.parent(this._subgraphMap[p_id]);
        }
        this._edgeMap[e_id] = edge;
        this._vertexMap[e_source].addOutEdge(edge);
        this._vertexMap[e_target].addInEdge(edge);
        return this;
    }

    mergeEdges(_edges: E[]): this {
        const eDiff = compare2(this.allEdges(), _edges, e => this._idFunc(e), this._updateFunc as any);
        eDiff.exit.forEach(e => this.removeEdge(this._idFunc(e)));
        eDiff.enter.forEach(e => this.addEdge(e));
        eDiff.update.forEach(e => this.updateEdge(e));
        return this;
    }

    updateEdge(e: E): this {
        const e_id = this._idFunc(e);
        const edge = this._edgeMap[e_id];
        if (!edge) throw new Error(`Edge '${e_id}' does not exist.`);
        const old_source = edge._source.id();
        const new_source = this._sourceFunc(e);
        if (old_source !== new_source) {
            this._vertexMap[old_source]?.removeOutEdge(e_id);
            this._vertexMap[new_source]?.addOutEdge(edge);
        }
        const old_target = edge._target.id();
        const new_target = this._targetFunc(e);
        if (old_target !== new_target) {
            this._vertexMap[old_target]?.removeInEdge(e_id);
            this._vertexMap[new_target]?.addInEdge(edge);
        }
        edge._ = e;
        edge._source = this._vertexMap[new_source];
        edge._target = this._vertexMap[new_target];
        return this;
    }

    removeEdge(id: ID): this {
        const e: EdgePlaceholder<E> = this._edgeMap[id];
        if (!e) throw new Error(`Edge '${id}' does not exist.`);

        const e_sourceID = this._idFunc(e._source._);
        if (!this.vertexExists(e_sourceID)) throw new Error(`Edge Source'${e_sourceID}' does not exist.`);
        this._vertexMap[e_sourceID].removeOutEdge(id);

        const e_targetID = this._idFunc(e._target._);
        if (!this.vertexExists(e_targetID)) throw new Error(`Edge Target'${e_targetID}' does not exist.`);
        this._vertexMap[e_targetID].removeInEdge(id);

        e.clearParent();
        delete this._edgeMap[id];
        return this;
    }

    private _hwalk(item: SubgraphPlaceholder<S> | VertexPlaceholder<V>, formatter: HierarchyFormatter<V, S>): object {
        if (item instanceof SubgraphPlaceholder) {
            return formatter("subgraph", item._, item.children().map(child => this._hwalk(child as SubgraphPlaceholder<S> | VertexPlaceholder<V>, formatter)));
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

    private _walk(sg: SubgraphPlaceholder<S>, visitor: Visitor<V, E, S>) {
        visitor.visitSubgraph(sg._);
        for (const child of sg.children()) {
            if (child instanceof SubgraphPlaceholder) {
                this._walk(child as SubgraphPlaceholder<S>, visitor);
            } else if (child instanceof EdgePlaceholder) {
                visitor.visitEdge(child._ as E);
            } else {
                visitor.visitVertex(child._ as V);
            }
        }
    }

    walk(visitor: Visitor<V, E, S>, startID?: ID) {
        if (!startID) {
            for (const id in this._subgraphMap) {
                const sg = this._subgraphMap[id];
                if (sg.parent() === undefined) {
                    this._walk(sg, visitor);
                }
            }
            for (const id in this._vertexMap) {
                const v = this._vertexMap[id];
                if (v.parent() === undefined) {
                    visitor.visitVertex(v._);
                }
            }
            for (const id in this._edgeMap) {
                const e = this._edgeMap[id];
                if (e.parent() === undefined) {
                    visitor.visitEdge(e._);
                }
            }
        } else {
            if (!this.subgraphExists(startID)) throw new Error(`Subgraph '${startID}' does not exist.`);
            this._walk(this._subgraphMap[startID], visitor);
        }
    }

    lineage(item: V | E | S): (V | E | S)[] {
        const retVal: (V | E | S)[] = [];
        let current: V | E | S | undefined = item;
        while (current !== undefined) {
            retVal.push(current);
            current = this.itemParent(this.id(current));
        }
        return retVal.reverse();
    }

    childCount(id: string | number): number {
        if (!this.subgraphExists(id)) return 0;
        let count = this.subgraphVertices(id).length;
        for (const sg of this.subgraphSubgraphs(id)) {
            count += this.childCount(this.id(sg));
        }
        return count;
    }

    dijkstra(source: ID, target: ID): { ids: ID[], len: number } {
        const edges = this.allEdges();
        const Q = new Set<string | number>();
        const prev: { [key: string]: string } = {};
        const dist: { [key: string]: number } = {};
        const adj: { [key: string]: { [key: string]: number } } = {};

        function vertex_with_min_dist(Q: Set<string | number>, dist: { [key: string]: number }) {
            let min_distance = Infinity;
            let u: string | number | null = null;

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

    sort(v_id?: string): V[] {
        const retVal: V[] = [];
        const visited: { [id: string]: boolean } = {};

        const visit = (vertex: VertexPlaceholder<V>, ancestors: VertexPlaceholder<V>[] = []) => {
            const v_id = vertex.id();
            if (visited[v_id]) return;
            visited[v_id] = true;
            ancestors.push(vertex);
            vertex.outEdges().forEach(e => {
                if (ancestors.indexOf(e._target as VertexPlaceholder<V>) < 0) {
                    visit(e._target as VertexPlaceholder<V>, [...ancestors]);
                }
            });
            retVal.unshift(vertex._);
        };

        if (v_id) {
            visit(this._vertexMap[v_id]);
        } else {
            for (const key in this._vertexMap) {
                visit(this._vertexMap[key]);
            }
        }

        return retVal;
    }
}

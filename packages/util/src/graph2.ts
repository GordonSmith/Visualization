import { compare2 } from "./array.ts";

export type ID = string | number;

export interface GraphItemT {
    id?: ID | (() => ID);
}

export interface ChildGraphItemT extends GraphItemT {
    parentID?: ID | (() => ID);
}

export interface VertexT extends ChildGraphItemT {
}

export interface EdgeT extends ChildGraphItemT {
    sourceID?: ID | (() => ID);
    targetID?: ID | (() => ID);
}

export interface SubgraphT extends ChildGraphItemT {
}

export type HierarchyFormatter<V, S> = (type: "subgraph" | "vertex", item: V | S, children?: object[]) => object;

export class Visitor<V extends VertexT, E extends EdgeT, S extends SubgraphT> {
    visitSubgraph(subgraph: S) { };
    visitVertex(vertex: V) { };
    visitEdge(edge: E) { };
}

export class Graph2<V extends VertexT, E extends EdgeT, S extends SubgraphT> {

    private _directed: boolean;

    // Direct data storage
    private _subgraphs: { [id: ID]: S } = {};
    private _vertices: { [id: ID]: V } = {};
    private _edges: { [id: ID]: E } = {};

    // Parent-child relationships
    private _parentOf: { [id: ID]: ID } = {};
    private _childrenOf: { [id: ID]: ID[] } = {};

    // Edge connectivity
    private _inEdgesOf: { [id: ID]: ID[] } = {};
    private _outEdgesOf: { [id: ID]: ID[] } = {};

    constructor(directed = true) {
        this._directed = directed;
    }

    clear(): this {
        this._subgraphs = {};
        this._vertices = {};
        this._edges = {};
        this._parentOf = {};
        this._childrenOf = {};
        this._inEdgesOf = {};
        this._outEdgesOf = {};
        return this;
    }

    clearParents(): this {
        for (const id in this._subgraphs) {
            this._reparent(id, undefined);
        }
        for (const id in this._vertices) {
            this._reparent(id, undefined);
        }
        return this;
    }

    isDirected(): boolean {
        return this._directed;
    }

    createView(selection: ID[]): this {
        const view = new (Object.getPrototypeOf(this).constructor)() as Graph2<V, E, S>;
        const idSet = new Set(selection);

        const addSubgraphRecursive = (sgId: ID, parent?: S) => {
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
                const item = this.item(id)!;
                const parentId = this.parentID(item);
                if (parentId && this.subgraphExists(parentId)) {
                    addSubgraphRecursive(parentId);
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

        return view as this;
    }

    // --- ID accessors ---
    protected _idFunc = (_: S | V | E): ID => typeof _.id === "function" ? _.id() : _.id!;
    idFunc(_: (_: S | V | E) => ID): this {
        this._idFunc = _;
        return this;
    }

    protected _parentFunc = (_: S | V | E): ID => typeof _.parentID === "function" ? _.parentID() : _.parentID!;
    parentFunc(_: (_: S | V | E) => ID): this {
        this._parentFunc = _;
        return this;
    }

    protected _sourceFunc = (_: E): ID => typeof _.sourceID === "function" ? _.sourceID() : _.sourceID!;
    sourceFunc(_: (_: E) => ID): this {
        this._sourceFunc = _;
        return this;
    }

    protected _targetFunc = (_: E): ID => typeof _.targetID === "function" ? _.targetID() : _.targetID!;
    targetFunc(_: (_: E) => ID): this {
        this._targetFunc = _;
        return this;
    }

    protected _updateFunc = (before: S | V | E, after: S | V | E): S | V | E => after;
    updateFunc(_: (before: S | V | E, after: S | V | E) => S | V | E): this {
        this._updateFunc = _;
        return this;
    }

    id(_: S | V | E): ID {
        return this._idFunc(_);
    }

    safeID(id: string) {
        return id.replace(/\s/, "_");
    }

    parentID(_: S | V | E): ID | undefined {
        return this._parentFunc(_);
    }

    sourceID(_: E): ID {
        return this._sourceFunc(_);
    }

    targetID(_: E): ID {
        return this._targetFunc(_);
    }

    // --- Internal helpers ---

    private _reparent(childId: ID, newParentId: ID | undefined): void {
        const oldParentId = this._parentOf[childId];
        if (oldParentId === newParentId) return;

        if (oldParentId !== undefined) {
            const siblings = this._childrenOf[oldParentId];
            if (siblings) {
                const idx = siblings.indexOf(childId);
                if (idx >= 0) siblings.splice(idx, 1);
            }
            delete this._parentOf[childId];
        }

        if (newParentId !== undefined) {
            this._parentOf[childId] = newParentId;
            let children = this._childrenOf[newParentId];
            if (!children) {
                children = [];
                this._childrenOf[newParentId] = children;
            }
            children.push(childId);
        }
    }

    private _updateEdgeConnectivity(e_id: ID, oldSource: ID, newSource: ID, oldTarget: ID, newTarget: ID): void {
        if (oldSource !== newSource) {
            this._removeFromArray(this._outEdgesOf[oldSource], e_id);
            this._outEdgesOf[newSource]?.push(e_id);
        }
        if (oldTarget !== newTarget) {
            this._removeFromArray(this._inEdgesOf[oldTarget], e_id);
            this._inEdgesOf[newTarget]?.push(e_id);
        }
    }

    private _removeFromArray(arr: ID[] | undefined, value: ID): void {
        if (!arr) return;
        const idx = arr.indexOf(value);
        if (idx >= 0) arr.splice(idx, 1);
    }

    // --- Type checks ---

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
            const parentId = this._parentOf[id];
            return parentId !== undefined ? this._subgraphs[parentId] : undefined;
        }
        return undefined;
    }

    // Subgraphs  ---
    allSubgraphs(): S[] {
        const retVal: S[] = [];
        for (const id in this._subgraphs) {
            retVal.push(this._subgraphs[id]);
        }
        return retVal;
    }

    subgraphs(): S[] {
        const retVal: S[] = [];
        for (const id in this._subgraphs) {
            if (this._parentOf[id] === undefined) {
                retVal.push(this._subgraphs[id]);
            }
        }
        return retVal;
    }

    subgraphExists(id: ID): boolean {
        return !!this._subgraphs[id];
    }

    subgraph(id: ID): S {
        return this._subgraphs[id];
    }

    subgraphSubgraphs(id: ID): S[] {
        const children = this._childrenOf[id];
        if (!children) return [];
        const retVal: S[] = [];
        for (const cid of children) {
            if (cid in this._subgraphs) retVal.push(this._subgraphs[cid]);
        }
        return retVal;
    }

    subgraphVertices(id: ID): V[] {
        const children = this._childrenOf[id];
        if (!children) return [];
        const retVal: V[] = [];
        for (const cid of children) {
            if (cid in this._vertices) retVal.push(this._vertices[cid]);
        }
        return retVal;
    }

    subgraphEdges(id: ID): E[] {
        const children = this._childrenOf[id];
        if (!children) return [];
        const retVal: E[] = [];
        for (const cid of children) {
            if (cid in this._edges) retVal.push(this._edges[cid]);
        }
        return retVal;
    }

    addSubgraph(s: S, parent?: S): this {
        const s_id = this._idFunc(s);
        if (this._subgraphs[s_id]) throw new Error(`Subgraph '${s_id}' already exists.`);
        this._subgraphs[s_id] = s;
        if (parent) {
            const p_id = this._idFunc(parent);
            if (!this._subgraphs[p_id]) throw new Error(`Subgraph '${p_id}' does not exist.`);
            this._reparent(s_id, p_id);
        }
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
        if (!this._subgraphs[sg_id]) throw new Error(`Subgraph '${sg_id}' does not exist.`);
        this._subgraphs[sg_id] = sg;
        return this;
    }

    removeSubgraph(id: ID, promoteChildren = true): this {
        if (!this._subgraphs[id]) throw new Error(`Subgraph '${id}' does not exist.`);
        const children = this._childrenOf[id];
        const parentId = this._parentOf[id];
        if (children) {
            // Copy since _reparent / remove mutates the array
            for (const childId of [...children]) {
                if (promoteChildren) {
                    this._reparent(childId, parentId);
                } else {
                    if (childId in this._subgraphs) {
                        this.removeSubgraph(childId);
                    } else {
                        this.removeVertex(childId);
                    }
                }
            }
        }
        this._reparent(id, undefined);
        delete this._childrenOf[id];
        delete this._subgraphs[id];
        return this;
    }

    subgraphParent(id: ID): S | undefined;
    subgraphParent(id: ID, parentID: ID): this;
    subgraphParent(id: ID, parentID?: ID): S | undefined | this {
        if (!this._subgraphs[id]) throw new Error(`Subgraph '${id}' does not exist.`);
        if (parentID === void 0) {
            const pid = this._parentOf[id];
            return pid !== undefined ? this._subgraphs[pid] : undefined;
        }
        if (!this._subgraphs[parentID]) throw new Error(`Subgraph parent '${parentID}' does not exist.`);
        this._reparent(id, parentID);
        return this;
    }

    // Vertices  ---
    allVertices(): V[] {
        const retVal: V[] = [];
        for (const id in this._vertices) {
            retVal.push(this._vertices[id]);
        }
        return retVal;
    }

    vertices(): V[] {
        const retVal: V[] = [];
        for (const id in this._vertices) {
            if (this._parentOf[id] === undefined) {
                retVal.push(this._vertices[id]);
            }
        }
        return retVal;
    }

    vertexExists(id: ID): boolean {
        return !!this._vertices[id];
    }

    vertex(id: ID): V {
        return this._vertices[id];
    }

    allEdges(): E[] {
        const retVal: E[] = [];
        for (const id in this._edges) {
            retVal.push(this._edges[id]);
        }
        return retVal;
    }

    edges(): E[] {
        const retVal: E[] = [];
        for (const id in this._edges) {
            if (this._parentOf[id] === undefined) {
                retVal.push(this._edges[id]);
            }
        }
        return retVal;
    }

    vertexEdges(vertexID: ID): E[] {
        const inIds = this._inEdgesOf[vertexID] ?? [];
        const outIds = this._outEdgesOf[vertexID] ?? [];
        return [...inIds, ...outIds].map(eid => this._edges[eid]);
    }

    inEdges(vertexID: ID): E[] {
        return (this._inEdgesOf[vertexID] ?? []).map(eid => this._edges[eid]);
    }

    outEdges(vertexID: ID): E[] {
        return (this._outEdgesOf[vertexID] ?? []).map(eid => this._edges[eid]);
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

    private _neighborIds(id: ID): ID[] {
        const outIds = (this._outEdgesOf[id] ?? []).map(eid => this._targetFunc(this._edges[eid]));
        const inIds = (this._inEdgesOf[id] ?? []).map(eid => this._sourceFunc(this._edges[eid]));
        return [...outIds, ...inIds];
    }

    neighbors(id: ID): V[] {
        return this._neighborIds(id).map(vid => this._vertices[vid]);
    }

    singleNeighbors(id: ID): V[] {
        return this._neighborIds(id)
            .filter(vid => {
                const inCount = this._inEdgesOf[vid]?.length ?? 0;
                const outCount = this._outEdgesOf[vid]?.length ?? 0;
                return inCount + outCount === 1;
            })
            .map(vid => this._vertices[vid]);
    }

    addVertex(v: V, parent?: S): this {
        const v_id = this._idFunc(v);
        if (this._vertices[v_id]) throw new Error(`Vertex '${v_id}' already exists.`);
        this._vertices[v_id] = v;
        this._inEdgesOf[v_id] = [];
        this._outEdgesOf[v_id] = [];
        if (parent) {
            const p_id = this._idFunc(parent);
            if (!this._subgraphs[p_id]) throw new Error(`Subgraph '${p_id}' does not exist.`);
            this._reparent(v_id, p_id);
        }
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
        if (!this._vertices[v_id]) throw new Error(`Vertex '${v_id}' does not exist.`);
        this._vertices[v_id] = v;
        return this;
    }

    removeVertex(id: ID): this {
        if (!this._vertices[id]) throw new Error(`Vertex '${id}' does not exist.`);
        // Copy edge arrays since removeEdge mutates them
        const inEdges = this._inEdgesOf[id];
        const outEdges = this._outEdgesOf[id];
        if (inEdges) {
            for (const eid of [...inEdges]) {
                this.removeEdge(eid);
            }
        }
        if (outEdges) {
            for (const eid of [...outEdges]) {
                this.removeEdge(eid);
            }
        }
        this._reparent(id, undefined);
        delete this._vertices[id];
        delete this._inEdgesOf[id];
        delete this._outEdgesOf[id];
        return this;
    }

    vertexParent(id: ID): S | undefined;
    vertexParent(id: ID, parentID: ID): this;
    vertexParent(id: ID, parentID?: ID): S | undefined | this {
        if (!this._vertices[id]) throw new Error(`Vertex '${id}' does not exist.`);
        if (parentID === void 0) {
            const pid = this._parentOf[id];
            return pid !== undefined ? this._subgraphs[pid] : undefined;
        }
        if (!this._subgraphs[parentID]) throw new Error(`Vertex parent '${parentID}' does not exist.`);
        this._reparent(id, parentID);
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
        return !!this._edges[id];
    }

    edge(id: ID): E {
        return this._edges[id];
    }

    addEdge(e: E, parent?: S): this {
        const e_id = this._idFunc(e);
        const e_source = this._sourceFunc(e);
        const e_target = this._targetFunc(e);
        if (this._edges[e_id]) throw new Error(`Edge '${e_id}' already exists.`);
        if (!this._vertices[e_source]) throw new Error(`Edge Source '${e_source}' does not exist.`);
        if (!this._vertices[e_target]) throw new Error(`Edge Target '${e_target}' does not exist.`);
        this._edges[e_id] = e;
        this._outEdgesOf[e_source].push(e_id);
        this._inEdgesOf[e_target].push(e_id);
        if (parent) {
            const p_id = this._idFunc(parent);
            if (!this._subgraphs[p_id]) throw new Error(`Subgraph '${p_id}' does not exist.`);
            this._reparent(e_id, p_id);
        }
        return this;
    }

    mergeEdges(_edges: E[]): this {
        // Snapshot old connectivity before compare2 (which may mutate stored edges via _updateFunc)
        const oldSources: { [id: ID]: ID } = {};
        const oldTargets: { [id: ID]: ID } = {};
        for (const id in this._edges) {
            oldSources[id] = this._sourceFunc(this._edges[id]);
            oldTargets[id] = this._targetFunc(this._edges[id]);
        }

        const eDiff = compare2(this.allEdges(), _edges, e => this._idFunc(e), this._updateFunc as any);
        eDiff.exit.forEach(e => this.removeEdge(this._idFunc(e)));
        eDiff.enter.forEach(e => this.addEdge(e));
        eDiff.update.forEach(e => {
            const e_id = this._idFunc(e);
            this._updateEdgeConnectivity(e_id,
                oldSources[e_id], this._sourceFunc(e),
                oldTargets[e_id], this._targetFunc(e));
            this._edges[e_id] = e;
        });
        return this;
    }

    updateEdge(e: E): this {
        const e_id = this._idFunc(e);
        if (!this._edges[e_id]) throw new Error(`Edge '${e_id}' does not exist.`);
        this._updateEdgeConnectivity(e_id,
            this._sourceFunc(this._edges[e_id]), this._sourceFunc(e),
            this._targetFunc(this._edges[e_id]), this._targetFunc(e));
        this._edges[e_id] = e;
        return this;
    }

    removeEdge(id: ID): this {
        if (!this._edges[id]) throw new Error(`Edge '${id}' does not exist.`);
        const sourceId = this._sourceFunc(this._edges[id]);
        if (!this._vertices[sourceId]) throw new Error(`Edge Source'${sourceId}' does not exist.`);
        this._removeFromArray(this._outEdgesOf[sourceId], id);
        const targetId = this._targetFunc(this._edges[id]);
        if (!this._vertices[targetId]) throw new Error(`Edge Target'${targetId}' does not exist.`);
        this._removeFromArray(this._inEdgesOf[targetId], id);
        this._reparent(id, undefined);
        delete this._edges[id];
        return this;
    }

    // Traversal  ---
    private _hwalk(id: ID, formatter: HierarchyFormatter<V, S>): object {
        if (id in this._subgraphs) {
            const children = this._childrenOf[id] ?? [];
            return formatter("subgraph", this._subgraphs[id], children.map(childId => this._hwalk(childId, formatter)));
        } else {
            return formatter("vertex", this._vertices[id]);
        }
    }

    hierarchy(formatter: HierarchyFormatter<V, S>): object[] {
        const retVal: object[] = [];
        for (const id in this._subgraphs) {
            if (this._parentOf[id] === undefined) {
                retVal.push(this._hwalk(id, formatter));
            }
        }
        for (const id in this._vertices) {
            if (this._parentOf[id] === undefined) {
                retVal.push(this._hwalk(id, formatter));
            }
        }
        return retVal;
    }

    private _walk(sgId: ID, visitor: Visitor<V, E, S>) {
        visitor.visitSubgraph(this._subgraphs[sgId]);
        const children = this._childrenOf[sgId] ?? [];
        for (const childId of children) {
            if (childId in this._subgraphs) {
                this._walk(childId, visitor);
            } else if (childId in this._edges) {
                visitor.visitEdge(this._edges[childId]);
            } else {
                visitor.visitVertex(this._vertices[childId]);
            }
        }
    }

    walk(visitor: Visitor<V, E, S>, startID?: ID) {
        if (!startID) {
            for (const id in this._subgraphs) {
                if (this._parentOf[id] === undefined) {
                    this._walk(id, visitor);
                }
            }
            for (const id in this._vertices) {
                if (this._parentOf[id] === undefined) {
                    visitor.visitVertex(this._vertices[id]);
                }
            }
            for (const id in this._edges) {
                if (this._parentOf[id] === undefined) {
                    visitor.visitEdge(this._edges[id]);
                }
            }
        } else {
            if (!this.subgraphExists(startID)) throw new Error(`Subgraph '${startID}' does not exist.`);
            this._walk(startID, visitor);
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
            const neighbors = Object.keys(adj[u]).filter(v => Q.has(v));

            Q.delete(u);

            if (u === target) break;

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

        const visit = (vid: ID, ancestors: ID[] = []) => {
            if (visited[vid]) return;
            visited[vid] = true;
            ancestors.push(vid);
            const outEdgeIds = this._outEdgesOf[vid] ?? [];
            for (const eid of outEdgeIds) {
                const targetId = this._targetFunc(this._edges[eid]);
                if (ancestors.indexOf(targetId) < 0) {
                    visit(targetId, [...ancestors]);
                }
            }
            retVal.unshift(this._vertices[vid]);
        };

        if (v_id) {
            visit(v_id);
        } else {
            for (const key in this._vertices) {
                visit(key);
            }
        }

        return retVal;
    }
}

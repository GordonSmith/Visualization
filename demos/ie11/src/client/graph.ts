import { Button, Spacer } from "@hpcc-js/common";
import { DataGraph, SankeyGraph } from "@hpcc-js/graph";
import { Edge, Vertex, VertexType } from "../server";
import { CustomCentroidVertex, CustomVertex } from "./vertex";

const typeFAChar = (type: VertexType) => {

    switch (type) {
        case "company":
            return "fa-industry";
        case "person":
            return "fa-user";
    }
    return "?";
};

function values<T>(obj: { [key: string]: T }): T[] {
    return Object.keys(obj).map(key => obj[key]);
}

function merge<T extends { id: number }>(items1: T[], items2: T[]) {
    const vIdx: { [id: string]: T } = {};
    for (const v of [...items1, ...items2]) {
        vIdx[v.id] = v;
    }
    return values(vIdx);
}

export class MainGraph extends DataGraph {

    _expandButton = new Button().faChar("fa-toggle-on").tooltip("Expand All");
    _contractButton = new Button().faChar("fa-toggle-off").tooltip("Hide Singletons");

    constructor() {
        super();
        this._iconBar.buttons([this._expandButton, this._contractButton, new Spacer(), ...this._iconBar.buttons()]);
        this
            .vertexColumns(["fachar", "id", "name", "centroid", "neighborCount", "tooltip", "payload"])
            .vertexFACharColumn("fachar")
            .vertexIDColumn("id")
            .vertexLabelColumn("name")
            .vertexCentroidColumn("centroid")
            .vertexRenderer(CustomVertex as any)
            .centroidRenderer(CustomCentroidVertex as any)
            .edgeColumns(["id", "sourceID", "targetID", "weight", "tooltip", "payload"])
            .edgeIDColumn("id")
            .edgeSourceColumn("sourceID")
            .edgeTargetColumn("targetID")
            .edgeLabelColumn("weight")
            .edgeArcDepth(10)
            .showToolbar(true)
            .layout("ForceDirected2")
            .treeRankDirection("TB")
            .highlightSelectedPathToCentroid(true)
            .applyScaleOnLayout(false)
            .allowDragging(true)
            .wasmFolder("https://raw.githack.com/Gordonsmith/Visualization/IE_11/demos/ie11/dist/")
            ;
    }

    mapVertex(v: Vertex, edges: Edge[]) {
        return [typeFAChar(v.type), v.id, v.name, v.centroid, edges.filter(e => e.sourceID === v.id || e.targetID === v.id).length, "", v as any];
    }

    mapEdge(e: Edge) {
        return [e.id, e.sourceID, e.targetID, e.weight, "", e as any];
    }

    loadData(vertices: Vertex[], edges: Edge[]) {
        this.vertices(vertices.map(v => this.mapVertex(v, edges)));
        this.edges(edges.map(e => this.mapEdge(e)));
        return this;
    }

    mergeData(vertices: Vertex[], edges: Edge[]) {
        const merged_vertices = merge(this.vertices().map(v => v[v.length - 1] as unknown as Vertex), vertices);
        const merged_edges = merge(this.edges().map(e => e[e.length - 1] as unknown as Edge), edges);
        this.loadData(merged_vertices, merged_edges);
        return this;
    }
}

export class MainSankey extends SankeyGraph {
    constructor() {
        super();
        this
            .vertexColumns(["type", "id", "name", "payload"])
            .vertexIDColumn("id")
            .vertexLabelColumn("name")
            .vertexCategoryColumn("type")
            .edgeColumns(["id", "sourceID", "targetID", "weight", "payload"])
            .edgeIDColumn("id")
            //  Reversed  ---
            .edgeSourceColumn("sourceID")
            .edgeTargetColumn("targetID")
            .edgeWeightColumn("weight")
            .vertexPadding(10)
            ;
    }

    loadData(vertices: Vertex[], edges: Edge[]) {
        this.vertices(vertices.map(row => [row.type, row.id, row.name, row as any]));
        this.edges(edges.map(row => [row.id, row.sourceID, row.targetID, row.weight, row as any]));
        return this;
    }

    mergeData(vertices: Vertex[], edges: Edge[]) {
        const merged_vertices = merge(this.vertices().map(v => v[v.length - 1] as unknown as Vertex), vertices);
        const merged_edges = merge(this.edges().map(e => e[e.length - 1] as unknown as Edge), edges);
        this.loadData(merged_vertices, merged_edges);
        return this;
    }
}

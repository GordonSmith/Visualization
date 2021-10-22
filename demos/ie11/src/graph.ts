import { Platform } from "@hpcc-js/common";
import { DataGraph, SankeyGraph } from "@hpcc-js/graph";

export type VertexType = "company" | "person";

export interface Vertex {
    type: VertexType;
    id: number;
    name: string
    payload: any;
}

export interface Edge {
    id: number;
    sourceID: number;
    targetID: number;
    weight: number;
    payload: any;
}

const typeFAChar = (type: VertexType) => {

    switch (type) {
        case "company":
            return "fa-industry";
        case "person":
            return "fa-user";
    }
    return "?";
};

export class MainGraph extends DataGraph {

    constructor() {
        super();
        this
            .vertexIconPadding(1)
            .vertexIconHeight(24)
            .vertexColumns(["fachar", "id", "name", "payload"])
            .vertexFACharColumn("fachar")
            .vertexIDColumn("id")
            .vertexLabelColumn("name")
            .edgeColumns(["id", "sourceID", "targetID", "weight", "payload"])
            .edgeIDColumn("id")
            .edgeSourceColumn("sourceID")
            .edgeTargetColumn("targetID")
            .edgeLabelColumn("weight")
            .treeRankDirection("TB")
            .applyScaleOnLayout(true)
            .showToolbar(true)
            .allowDragging(false)
            .layout(Platform.isIE ? "Hierarchy" : "DOT")
            .wasmFolder("https://raw.githack.com/Gordonsmith/Visualization/IE_11/demos/ie11/dist/")
            ;
    }

    loadData(vertices: Vertex[], edges: Edge[]) {
        this.vertices(vertices.map(row => [typeFAChar(row.type), row.id, row.name, row.payload]));
        this.edges(edges.map(row => [row.id, row.sourceID, row.targetID, row.weight, row.payload]));
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
            .edgeSourceColumn("targetID")
            .edgeTargetColumn("sourceID")
            .edgeWeightColumn("weight")
            .vertexPadding(100)
            ;
    }

    loadData(vertices: Vertex[], edges: Edge[]) {
        this.vertices(vertices.map(row => [typeFAChar(row.type), row.id, row.name, row.payload]));
        this.edges(edges.map(row => [row.id, row.sourceID, row.targetID, row.weight, row.payload]));
        return this;
    }
}

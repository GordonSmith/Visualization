import { Graph2 } from "@hpcc-js/util";
//@ts-ignore
import devData from "./data/costa_dei_trabocchi_cmpbos.json";

export { devData };
export type RawDataT = typeof devData;

export type VertexType = "company" | "person";

export interface Vertex {
    type: VertexType;
    id: number;
    name: string;
    centroid: boolean;
    neighbors?: {
        company: number,
        person: number,
        total: number
    },
    payload: any;
}

export interface Edge {
    type: "relationship",
    id: number;
    sourceID: number;
    targetID: number;
    weight: number;
    payload: any;
}

class GraphContainer extends Graph2<Vertex, Edge> {

    constructor() {
        super();
        this
            .idFunc(d => d.id)
            .sourceFunc(d => d.sourceID)
            .targetFunc(d => d.targetID)
            ;
    }
}

export class GraphDB {

    protected _graph: GraphContainer;
    protected _centroids: Vertex[] = [];

    constructor() {
        this._graph = new GraphContainer();
    }

    load(rawData: RawDataT) {
        this._graph.clear();
        rawData?.organization?.beneficialOwnership?.beneficialOwners?.forEach(row => {
            this._graph.addVertex({
                type: !!row.duns ? "company" : "person",
                id: row.memberID,
                name: row.name,
                centroid: row.duns === rawData.inquiryDetail.duns,
                payload: row
            });
        });
        rawData?.organization?.beneficialOwnership?.relationships?.forEach(row => {
            this._graph.addEdge({
                type: "relationship",
                id: row.relationshipID,
                sourceID: row.sourceMemberID,
                targetID: row.targetMemberID,
                weight: row.sharePercentage ?? 0,
                payload: row
            });
        });
        this.updateNeighbors();
        return this;
    }

    subgraph(memberID?: number, depth: number = 1) {
        const retVal = new GraphContainer();
        const vertices = this._graph.vertices();
        const edges = this._graph.edges();
        const roots = memberID ? vertices.filter(row => row.id === memberID) : vertices.filter(row => row.centroid);
        roots.forEach(root => {
            retVal.addVertex(root);
            let queue = [root];
            let level = 0;
            while (queue.length && level < depth) {
                const nextLevel = [];
                queue.forEach(v => {
                    edges.forEach(e => {
                        let target: Vertex;
                        if (e.sourceID === v.id) {
                            target = this._graph.vertex(e.targetID);
                        } else if (e.targetID === v.id) {
                            target = this._graph.vertex(e.sourceID);
                        }
                        if (target) {
                            if (!retVal.vertexExists(target.id)) {
                                retVal.addVertex(target);
                                nextLevel.push(target);
                            }
                            if (!retVal.edgeExists(e.id)) {
                                retVal.addEdge(e);
                            }
                        }
                    });
                });
                queue = nextLevel;
                level++;
            }
        });
        return retVal;
    }

    companies() {
        return this._graph.vertices()
            .filter(row => row.type === "company")
            ;
    }

    people() {
        return this._graph.vertices()
            .filter(row => row.type === "person")
            ;
    }

    updateNeighbors() {
        this._graph.vertices().forEach(v => {
            v.neighbors = {
                company: 0,
                person: 0,
                total: 0
            };
            this._graph.neighbors(v.id).forEach(n => {
                switch (n.type) {
                    case "company":
                        ++v.neighbors.company;
                        ++v.neighbors.total;
                        break;
                    case "person":
                        ++v.neighbors.person;
                        ++v.neighbors.total;
                        break;
                }
            });
        });
    }

    vertices(): Vertex[] {
        return this._graph.vertices();
    }

    edges(): Edge[] {
        return this._graph.edges();
    }
}

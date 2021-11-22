const codemirror = window["@hpcc-js/codemirror"];
const common = window["@hpcc-js/common"];
const graph = window["@hpcc-js/graph"];
const phosphor = window["@hpcc-js/phosphor"];
const util = window["@hpcc-js/util"];

/*********************************************************************
 * Server
 *********************************************************************/

class GraphContainer extends util.Graph2 {
    constructor() {
        super();
        this
            .idFunc(d => d.id)
            .sourceFunc(d => d.sourceID)
            .targetFunc(d => d.targetID);
    }
}

class GraphDB {
    constructor() {
        this._centroids = [];
        this._graph = new GraphContainer();
    }
    load(rawData) {
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
    subgraph(memberID, depth = 1) {
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
                        let target;
                        if (e.sourceID === v.id) {
                            target = this._graph.vertex(e.targetID);
                        }
                        else if (e.targetID === v.id) {
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
            .filter(row => row.type === "company");
    }
    people() {
        return this._graph.vertices()
            .filter(row => row.type === "person");
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
    vertices() {
        return this._graph.vertices();
    }
    edges() {
        return this._graph.edges();
    }
}

let m_rawData;
const db = new GraphDB()
    .load(m_rawData);

function rawData(_) {
    if (!arguments.length)
        return m_rawData;
    m_rawData = _;
    db.load(_);
}

function fetchGraph(memberID, depth = 1) {
    const subgraph = db.subgraph(memberID, depth);
    return Promise.resolve({
        vertices: subgraph.vertices(),
        edges: subgraph.edges()
    });
}

/*********************************************************************
 * Client
 *********************************************************************/

const typeFAChar = (type) => {
    switch (type) {
        case "company":
            return "fa-industry";
        case "person":
            return "fa-user";
    }
    return "?";
};

function values(obj) {
    return Object.keys(obj).map(key => obj[key]);
}

function merge(items1, items2) {
    const vIdx = {};
    for (const v of [...items1, ...items2]) {
        vIdx[v.id] = v;
    }
    return values(vIdx);
}

class MainGraph extends graph.DataGraph {
    constructor() {
        super();
        this._expandButton = new common.Button().faChar("fa-toggle-on").tooltip("Expand All");
        this._contractButton = new common.Button().faChar("fa-toggle-off").tooltip("Hide Singletons");
        this._iconBar.buttons([this._expandButton, this._contractButton, new common.Spacer(), ...this._iconBar.buttons()]);
        this
            .vertexColumns(["fachar", "id", "name", "centroid", "neighborCount", "tooltip", "payload"])
            .vertexFACharColumn("fachar")
            .vertexIDColumn("id")
            .vertexLabelColumn("name")
            .vertexCentroidColumn("centroid")
            // .vertexRenderer(CustomVertex)
            // .centroidRenderer(CustomCentroidVertex)
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
            .wasmFolder("https://cdn.jsdelivr.net/npm/@hpcc-js/graph/dist")
            ;
    }
    mapVertex(v, edges) {
        return [typeFAChar(v.type), v.id, v.name, v.centroid, edges.filter(e => e.sourceID === v.id || e.targetID === v.id).length, "", v];
    }
    mapEdge(e) {
        return [e.id, e.sourceID, e.targetID, e.weight, "", e];
    }
    loadData(vertices, edges) {
        this.vertices(vertices.map(v => this.mapVertex(v, edges)));
        this.edges(edges.map(e => this.mapEdge(e)));
        return this;
    }
    mergeData(vertices, edges) {
        const merged_vertices = merge(this.vertices().map(v => v[v.length - 1]), vertices);
        const merged_edges = merge(this.edges().map(e => e[e.length - 1]), edges);
        this.loadData(merged_vertices, merged_edges);
        return this;
    }
}

//  Dock Panel ---
class Dashboard extends phosphor.DockPanel {

    constructor(target) {
        super();
        // protected _data = new DataWrangler();
        this._mainGraph = new MainGraph()
            .on("vertex_click", (row, col, sel) => {
                this.graphSelection(this._mainGraph.selection());
            })
            .on("vertex_dblclick", (row, col, sel) => {
                this.fetchGraph(row.id);
            });

        this._dataEditor = new codemirror.JSONEditor();
        this._propsEditor = new codemirror.JSONEditor()
            .readOnly(true)
            .json({});

        this._mainGraph._contractButton
            .on("click", () => {
                const vertexIdx = {};
                this._mainGraph.edges().forEach(row => {
                    const origData = row[row.length - 1];
                    if (vertexIdx[origData.sourceID] === undefined) {
                        vertexIdx[origData.sourceID] = 0;
                    }
                    ++vertexIdx[origData.sourceID];
                    if (vertexIdx[origData.targetID] === undefined) {
                        vertexIdx[origData.targetID] = 0;
                    }
                    ++vertexIdx[origData.targetID];
                });
                const removed = {};
                this._mainGraph.vertices(this._mainGraph.vertices().filter((row => {
                    const origData = row[row.length - 1];
                    if (vertexIdx[origData.id] === 1 && origData?.neighbors?.total === 1) {
                        vertexIdx[origData.id] = 0;
                        return false;
                    }
                    return true;
                })));
                this._mainGraph.edges(this._mainGraph.edges().filter((row => {
                    const origData = row[row.length - 1];
                    return !(removed[origData?.sourceID] === 0 || removed[origData?.targetID] === 0);
                })));
                this._mainGraph.lazyRender();
            });
        this._mainGraph._expandButton
            .on("click", () => {
                this._mainGraph.selection().forEach(async (row) => {
                    await this.fetchGraph(row.origData.id);
                });
            });
        this
            .target(target)
            .addWidget(this._mainGraph, "Graph")
            .addWidget(this._dataEditor, "Data (paste here!!!)", "split-bottom", this._mainGraph)
            .addWidget(this._propsEditor, "Selected Details", "split-right", this._personTable)
            .render();
        this._dataEditor.on("changes", () => {
            rawData(this._dataEditor.json());
            this.reset();
        });
    }
    reset() {
        this._mainGraph.resetLayout();

        fetchGraph().then(graph => {
            this._mainGraph
                .loadData(graph.vertices, graph.edges);
            this.lazyRender();
        });
    }

    fetchGraph(id) {
        return fetchGraph(id, 1).then(graph => {
            this._mainGraph
                .mergeData(graph.vertices, graph.edges)
                .resetLayout()
                .lazyRender();
        });
    }

    //  Selection  ---
    graphSelection(selection) {
        this._propsEditor
            .json(selection.map(row => row.origData?.payload?.payload))
            .lazyRender();
    }
    tableSelection(selection) {
        if (selection.length) {
            this._mainGraph
                .selection([selection[0].__lparam])
                .centerOnItem(selection[0].__lparam.id);
        }
        this._propsEditor
            .json(selection.map(row => row.__lparam))
            .lazyRender();
    }
}

const app = new Dashboard("placeholder").lazyRender();
window.addEventListener("resize", () => {
    app
        .resize()
        .lazyRender();
});

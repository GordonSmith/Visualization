import * as dagre from "dagre";

export function GraphData() {
    dagre.graphlib.Graph.call(this, { multigraph: true, compound: true });
    this.setGraph({});
    this.setDefaultNodeLabel(function () { return {}; });
    this.setDefaultEdgeLabel(function () { return {}; });
}
GraphData.prototype = Object.create(dagre.graphlib.Graph.prototype);
GraphData.prototype.constructor = GraphData;

GraphData.prototype.setData = function (vertices, edges, hierarchy, merge) {
    const context = this;
    const retVal = {
        addedVertices: [],
        addedEdges: []
    };

    //  Add new items  ---
    for (let i = 0; i < vertices.length; ++i) {
        const entity = vertices[i];
        if (!merge || !this.hasNode(entity._id)) {
            this.setNode(entity._id, entity);
            retVal.addedVertices.push(entity);
        }
    }
    for (let i = 0; i < edges.length; ++i) {
        const edge = edges[i];
        if (!merge || !this.hasEdge(edge._id)) {
            if (edge._sourceVertex && edge._targetVertex) {
                this.setEdge(edge._sourceVertex._id, edge._targetVertex._id, edge, edge._id);
                retVal.addedEdges.push(edge);
            } else {
                console.log("Bad edge definition");
            }
        }
    }
    if (hierarchy) {
        for (let i = 0; i < hierarchy.length; ++i) {
            this.setParent(hierarchy[i].child._id, hierarchy[i].parent._id);
        }
    }

    //  Remove old items  ---
    if (merge) {
        const edgeIDs = edges.map(function (item) { return item._id; });
        this.filterEdges(function (item) { return edgeIDs.indexOf(item.v + "_" + item.w) < 0; })
            .forEach(function (_item) {
                /*  TODO  ---
                try {
                    context.delEdge(item);
                } catch (e) {
                    var d = 0;
                }
                */
            })
            ;
        const vertexIDs = vertices.map(function (item) { return item._id; });
        this.filterNodes(function (item) { return vertexIDs.indexOf(item) < 0; })
            .forEach(function (item) {
                try {
                    context.delNode(item);
                } catch (e) {
                }
            })
            ;
    }
    return retVal;
};

GraphData.prototype.filterEdges = function (pred) {
    const filtered = [];
    this.eachEdge(function (e) {
        if (pred(e)) {
            filtered.push(e);
        }
    });
    return filtered;
};

GraphData.prototype.filterNodes = function (pred) {
    const filtered = [];
    this.eachNode(function (e) {
        if (pred(e)) {
            filtered.push(e);
        }
    });
    return filtered;
};

GraphData.prototype.nodeValues = function () {
    const retVal = [];
    this.nodes().forEach(function (item) {
        retVal.push(this.node(item));
    }, this);
    return retVal;
};

GraphData.prototype.eachNode = function (callback) {
    this.nodes().forEach(function (item) {
        callback(item, this.node(item));
    }, this);
};

GraphData.prototype.edgeValues = function () {
    const retVal = [];
    this.edges().forEach(function (item) {
        retVal.push(this.edge(item));
    }, this);
    return retVal;
};

GraphData.prototype.eachEdge = function (callback) {
    this.edges().forEach(function (item) {
        callback(item, item.v, item.w, this.edge(item));
    }, this);
};

GraphData.prototype.getJSON = function () {
    const graphObj = dagre.graphlib.json.write(this);
    return JSON.stringify(graphObj, function (key, value) {
        if (key === "value") {
            if (value._text && value._text._text) {
                return value._text._text;
            }
            return value._id;
        }
        return value;
    }, "  ");
};

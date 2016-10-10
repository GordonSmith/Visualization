export default class IGraph {
}

//  Events  ---
IGraph.prototype.vertex_click = function (row, col, sel, more) {
    if (more && more.vertex) {
        console.log("Vertex click: " + more.vertex.id());
    }
};

IGraph.prototype.vertex_dblclick = function (row, col, sel, more) {
    if (more && more.vertex) {
        console.log("Vertex double click: " + more.vertex.id());
    }
};

IGraph.prototype.edge_click = function (row, col, sel, more) {
    if (more && more.edge) {
        console.log("Edge click: " + more.edge.id());
    }
};

IGraph.prototype.edge_dblclick = function (row, col, sel, more) {
    if (more && more.edge) {
        console.log("Edge double click: " + more.edge.id());
    }
};

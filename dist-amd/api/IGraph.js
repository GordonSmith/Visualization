!function(e,o){"function"==typeof define&&define.amd?define([],o):e.api_IGraph=o()}(this,function(){function e(){}return e.prototype.vertex_click=function(e,o,c,t){t&&t.vertex&&console.log("Vertex click: "+t.vertex.id())},e.prototype.vertex_dblclick=function(e,o,c,t){t&&t.vertex&&console.log("Vertex double click: "+t.vertex.id())},e.prototype.edge_click=function(e,o,c,t){t&&t.edge&&console.log("Edge click: "+t.edge.id())},e.prototype.edge_dblclick=function(e,o,c,t){t&&t.edge&&console.log("Edge double click: "+t.edge.id())},e});
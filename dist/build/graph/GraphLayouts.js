(function(e,t){typeof define=="function"&&define.amd?define(["lib/dagre/dagre"],t):e.Graph_GraphLayouts=t(e.dagre)})(this,function(e){function t(e,t,n,r){var i=this;this.pos={};var s=0;r=r||(t<n?t-s:n-s)/2;var o=e.nodeCount(),u=-Math.PI/2,a=2*Math.PI/o;e.eachNode(function(e,t){var n=t.getBBox(!0),s=Math.max(n.width,n.height);i.pos[e]={x:t.fixed?t.x:Math.cos(u)*(r-s),y:t.fixed?t.y:Math.sin(u)*(r-s),width:n.width,height:n.height},u+=a})}function n(e,t,n,r){var i=this;this.pos={},e.eachNode(function(e,t){i.pos[e]={x:t.x,y:t.y,width:t.width,height:t.height}})}function r(e,t,n,r){var i=this;this.pos={},this.vertices=[],this.vertexMap={},e.eachNode(function(t){var n=e.node(t),r=n.getBBox(!0),s={id:t,x:n.pos().x,y:n.pos().y,width:r.width,height:r.height,value:n};i.vertices.push(s),i.vertexMap[t]=s}),this.edges=[],e.eachEdge(function(t,n,r){var s=e.edge(t);i.edges.push({source:i.vertexMap[n],target:i.vertexMap[r]})}),this.force=d3.layout.force().charge(function(e){var t=e.value.getBBox();return-25*Math.max(t.width,t.height)}).linkDistance(300).nodes(this.vertices).links(this.edges);if(r){this.force.start();var s=e.nodeCount();s=Math.min(s*s,500);for(var o=0;o<s;++o)this.force.tick();this.force.stop()}}function i(t,n,r,i){var s=(new e.graphlib.Graph({multigraph:!0,compound:!0})).setGraph(i).setDefaultNodeLabel(function(){return{}}).setDefaultEdgeLabel(function(){return{}});t.eachNode(function(e){var n=t.node(e),r=n.getBBox();s.setNode(e,{width:r.width,height:r.height})}),t.eachEdge(function(e,n,r){var i=t.edge(e);s.setEdge(n,r,{weight:i.weight()})}),t.eachNode(function(e){s.setParent(e,t.parent(e))}),this.dagreLayout=e.layout(s);var o=-s.graph().width/2,u=-s.graph().height/2;s.nodes().forEach(function(e){var t=s.node(e);t.x+=o,t.y+=u}),s.edges().forEach(function(e){var t=s.edge(e);for(var n=0;n<t.points.length;++n)t.points[n].x+=o,t.points[n].y+=u}),this.digraph=s}t.prototype.nodePos=function(e){return this.pos[e]},t.prototype.edgePoints=function(e){return[]},n.prototype.nodePos=function(e){return this.pos[e]},n.prototype.edgePoints=function(e){return[]},r.prototype.nodePos=function(e){return this.vertexMap[e]},r.prototype.edgePoints=function(e){return[]},i.prototype.nodePos=function(e){return this.digraph.node(e)},i.prototype.edgePoints=function(e){return this.digraph.edge(e).points};var s={None:n,Circle:t,ForceDirected:r,Hierarchy:i};return s});
(function(e,t){typeof define=="function"&&define.amd?define(["d3/d3","../common/SVGWidget","./IGraph","./Vertex","./GraphData","./GraphLayouts","../other/Bag","css!./Graph"],t):e.graph_Graph=t(e.d3,e.common_SVGWidget,e.graph_IGraph,e.graph_Vertex,e.graph_GraphData,e.graph_GraphLayouts,e.other_Bag)})(this,function(e,t,n,r,i,s,o){function u(){t.call(this),n.call(this),this._class="graph_Graph",this.graphData=new i,this._transitionDuration=250,this.highlight={zoom:1.1,opacity:.33,edge:"1.25px",transition:this._transitionDuration},this._showEdges=!0,this._highlightOnMouseOverVertex=!1,this._highlightOnMouseOverEdge=!1,this._shrinkToFitOnLayout=!1,this._layout="",this._hierarchyOptions={},this._snapToGrid=0,this._allowDragging=!0,this._selection=new o.Selection}return u.prototype=Object.create(t.prototype),u.prototype.implements(n.prototype),u.prototype.getOffsetPos=function(){return{x:0,y:0}},u.prototype.size=function(e){var n=t.prototype.size.apply(this,arguments);return arguments.length&&this._svgZoom&&this._svgZoom.attr("x",-this._size.width/2).attr("y",-this._size.height/2).attr("width",this._size.width).attr("height",this._size.height),n},u.prototype.clear=function(){this.data({vertices:[],edges:[],hierarchy:[],merge:!1})},u.prototype.data=function(e){var n=t.prototype.data.apply(this,arguments);if(arguments.length){this._data.merge||(this.graphData=new i,this._renderCount=0);var r=this.graphData.setData(this._data.vertices,this._data.edges,this._data.hierarchy,this._data.merge),s=this;r.addedVertices.forEach(function(e){e.pos({x:+Math.random()*10/2-5,y:+Math.random()*10/2-5})}),r.addedEdges.forEach(function(e){e._sourceMarker&&(e._sourceMarker=s._id+"_"+e._sourceMarker),e._targetMarker&&(e._targetMarker=s._id+"_"+e._targetMarker)})}return n},u.prototype.showEdges=function(e){return arguments.length?(this._showEdges=e,this):this._showEdges},u.prototype.highlightOnMouseOverVertex=function(e){return arguments.length?(this._highlightOnMouseOverVertex=e,this):this._highlightOnMouseOverVertex},u.prototype.highlightOnMouseOverEdge=function(e){return arguments.length?(this._highlightOnMouseOverEdge=e,this):this._highlightOnMouseOverEdge},u.prototype.shrinkToFitOnLayout=function(e){return arguments.length?(this._shrinkToFitOnLayout=e,this):this._shrinkToFitOnLayout},u.prototype.hierarchyOptions=function(e){return arguments.length?(this._hierarchyOptions=e,this):this._hierarchyOptions},u.prototype.snapToGrid=function(e){return arguments.length?(this._snapToGrid=e,this):this._snapToGrid},u.prototype.allowDragging=function(e){return arguments.length?(this._allowDragging=e,this):this._allowDragging},u.prototype.selection=function(e){return arguments.length?(this._selection.set(e),this):this._selection.get()},u.prototype.setZoom=function(e,t,n){this.zoom&&(this.zoom.translate(e),this.zoom.scale(t),this.applyZoom(n))},u.prototype.applyZoom=function(t){e.event&&e.event.sourceEvent&&!e.event.sourceEvent.ctrlKey&&(e.event.sourceEvent.type==="wheel"||e.event.sourceEvent.type==="mousewheel"||e.event.sourceEvent.type==="DOMMouseScroll")&&e.event.sourceEvent.wheelDelta&&(this.zoom.translate([this.prevTranslate[0],this.prevTranslate[1]+e.event.sourceEvent.wheelDelta]),this.zoom.scale(this.prevScale)),(t?this.svg.transition().duration(t):this.svg).attr("transform","translate("+this.zoom.translate()+")scale("+this.zoom.scale()+")"),this.prevTranslate=this.zoom.translate(),this.prevScale!==this.zoom.scale()&&(this._fixIEMarkers(),this.prevScale=this.zoom.scale()),this.brush.x(e.scale.identity().domain([(-this.prevTranslate[0]-this._size.width/2)*1/this.zoom.scale(),(-this.prevTranslate[0]+this._size.width/2)*1/this.zoom.scale()])),this.brush.y(e.scale.identity().domain([(-this.prevTranslate[1]-this._size.height/2)*1/this.zoom.scale(),(-this.prevTranslate[1]+this._size.height/2)*1/this.zoom.scale()]))},u.prototype.enter=function(n,r,i){function o(t){if(s._allowDragging){e.event.sourceEvent.stopPropagation(),s._dragging=!0;if(s.forceLayout){var n=s.forceLayout.vertexMap[t.id()];n.fixed=!0}s.svgMarkerGlitch&&s.graphData.nodeEdges(t.id()).forEach(function(e){var t=s.graphData.edge(e);s._pushMarkers(t.element(),t)})}}function u(t){if(s._allowDragging){e.event.sourceEvent.stopPropagation(),t.move({x:e.event.x,y:e.event.y});if(s.forceLayout){var n=s.forceLayout.vertexMap[t.id()];n.fixed=!0,n.x=n.px=e.event.x,n.y=n.py=e.event.y}s.refreshIncidentEdges(t,!0)}}function a(t){if(s._allowDragging){e.event.sourceEvent.stopPropagation(),s._dragging=!1;if(s._snapToGrid){var n=t.calcSnap(s._snapToGrid);t.move(n[0]),s.refreshIncidentEdges(t,!0)}if(s.forceLayout){var r=s.forceLayout.vertexMap[t.id()];r.fixed=!1}s.svgMarkerGlitch&&s.graphData.nodeEdges(t.id()).forEach(function(e){var t=s.graphData.edge(e);s._popMarkers(t.element(),t)})}}t.prototype.enter.apply(this,arguments);var s=this;this.prevTranslate=[0,0],this.prevScale=1,this.zoom=e.behavior.zoom().scaleExtent([.01,4]).on("zoomstart",function(t){s.prevTranslate=s.zoom.translate(),s.prevScale=s.zoom.scale(),e.event.sourceEvent&&e.event.sourceEvent.shiftKey&&e.event.sourceEvent.ctrlKey?s._zoomMode="selection":e.event.sourceEvent&&e.event.sourceEvent.shiftKey?(s._zoomMode="selection",s._selection.clear()):s._zoomMode="zoom";switch(s._zoomMode){case"selection":r.select(".extent").style("visibility",null);break;default:r.select(".extent").style("visibility","hidden")}}).on("zoomend",function(e){switch(s._zoomMode){case"selection":s.zoom.translate(s.prevTranslate),s.zoom.scale(s.prevScale);break;default:}s._svgBrush.call(s.brush.clear())}).on("zoom",function(e){switch(s._zoomMode){case"selection":break;default:s.applyZoom()}}),this.brush=e.svg.brush().x(e.scale.identity().domain([-s._size.width/2,s._size.width/2])).y(e.scale.identity().domain([-s._size.height/2,s._size.height/2])).on("brushstart",function(e){switch(s._zoomMode){case"selection":break;default:}}).on("brushend",function(t){switch(s._zoomMode){case"selection":var n=e.event.target.extent();s.svgV.selectAll(".graphVertex").select("*").each(function(e){n[0][0]<=e.x()&&e.x()<n[1][0]&&n[0][1]<=e.y()&&e.y()<n[1][1]&&s._selection.append(e)});break;default:}}).on("brush",function(){switch(s._zoomMode){case"selection":var t=s.zoom.translate();console.log(t[0]);var n=e.event.target.extent();s.svgV.selectAll(".graphVertex").select("*").classed("selected",function(e){return s._selection.isSelected(e)||n[0][0]<=e.x()&&e.x()<n[1][0]&&n[0][1]<=e.y()&&e.y()<n[1][1]});break;default:}}),this.drag=e.behavior.drag().origin(function(e){return e.pos()}).on("dragstart",o).on("dragend",a).on("drag",u),this._svgZoom=r.append("rect").attr("class","zoom").attr("x",-this._size.width/2).attr("y",-this._size.height/2).attr("width",this._size.width).attr("height",this._size.height),this.defs=r.append("defs"),this.addMarkers(),r.call(this.zoom),this.svg=r.append("g"),this._svgBrush=this.svg.append("g").attr("class","selectionBrush").call(this.brush),this._svgBrush.select(".background").style("cursor",null),s._svgBrush.call(s.brush.clear()),this.svgC=this.svg.append("g").attr("id",this._id+"C"),this.svgE=this.svg.append("g").attr("id",this._id+"E"),this.svgV=this.svg.append("g").attr("id",this._id+"V")},u.prototype.getBounds=function(e,t){var n=[[null,null],[null,null]];return e.forEach(function(e){var r=t?t.nodePos(e._id):{x:e.x(),y:e.y(),width:e.width(),height:e.height()},i=r.x-r.width/2,s=r.x+r.width/2,o=r.y-r.height/2,u=r.y+r.height/2;if(n[0][0]===null||n[0][0]>i)n[0][0]=i;if(n[0][1]===null||n[0][1]>o)n[0][1]=o;if(n[1][0]===null||n[1][0]<s)n[1][0]=s;if(n[1][1]===null||n[1][1]<u)n[1][1]=u}),n},u.prototype.getVertexBounds=function(e){return this.getBounds(this.graphData.nodeValues(),e)},u.prototype.getSelectionBounds=function(e){return this.getBounds(this._selection.get(),e)},u.prototype.shrinkToFit=function(e,t){var n=this.width(),r=this.height(),i=e[1][0]-e[0][0],s=e[1][1]-e[0][1],o=(e[0][0]+e[1][0])/2,u=(e[0][1]+e[1][1])/2,a=1/Math.max(i/n,s/r);a>1&&(a=1);var f=[-a*o,-a*u];this.setZoom(f,a,t)},u.prototype.zoomToLevels=["all","width","selection","100%"],u.prototype.zoomTo=function(e,t){switch(e){case"all":this.shrinkToFit(this.getVertexBounds(),t);break;case"width":var n=this.getVertexBounds();n[0][1]=0,n[1][1]=0,this.shrinkToFit(n,t);break;case"selection":this.shrinkToFit(this._selection.isEmpty()?this.getVertexBounds():this.getSelectionBounds(),t);break;case"100%":this.zoom.scale(1),this.applyZoom(t)}},u.prototype.centerOn=function(e,t){var n=(e[0][0]+e[1][0])/2,r=(e[0][1]+e[1][1])/2,i=[n,r];this.setZoom(i,1,t)},u.prototype.layout=function(e,t){if(!arguments.length)return this._layout;this._layout=e;if(this._renderCount){this.forceLayout&&(this.forceLayout.force.stop(),this.forceLayout=null);var n=this,r=this.getLayoutEngine();if(this._layout=="ForceDirected2"){this.forceLayout=r;var n=this;this.forceLayout.force.on("tick",function(e){r.vertices.forEach(function(e){var t=n.graphData.node(e.id);e.fixed?(e.x=e.px,e.y=e.py):(e.px=e.x,e.py=e.y,t.move({x:e.x,y:e.y}))}),n.graphData.edgeValues().forEach(function(e){e.points([],!1,!1)});if(n._shrinkToFitOnLayout){var t=n.getVertexBounds(r);n.shrinkToFit(t)}}),this.forceLayout.force.start()}else if(r){this.forceLayout=null,n._dragging=!0,n.graphData.nodeValues().forEach(function(e){var n=r.nodePos(e._id);e.move({x:n.x,y:n.y},t),n.width&&n.height&&!e.width()&&!e.height()&&e.width(n.width).height(n.height).render()}),n.graphData.edgeValues().forEach(function(e){var n=r.edgePoints({v:e._sourceVertex.id(),w:e._targetVertex.id()});e.points(n,t)});if(n._shrinkToFitOnLayout){var i=n.getVertexBounds(r);n.shrinkToFit(i,t)}this._fixIEMarkers(),setTimeout(function(){n._dragging=!1},t?t+50:50)}}return this},u.prototype.update=function(n,r,i){function u(e){e.target(this).render(),e.element().call(s.drag),e.dispatch&&(e.dispatch.on("sizestart",function(e,t){e.allowResize(s._allowDragging),s._allowDragging&&(s._dragging=!0)}),e.dispatch.on("size",function(e,t){s.refreshIncidentEdges(e,!1)}),e.dispatch.on("sizeend",function(e,t){s._dragging=!1;if(s._snapToGrid){var n=e.calcSnap(s._snapToGrid);e.pos(n[0]).size(n[1]).render(),s.refreshIncidentEdges(e,!1)}}))}function f(e){e.target(this).render()}function l(e){e.render()}function c(e){e.render()}t.prototype.update.apply(this,arguments);var s=this,o=this.svgV.selectAll("#"+this._id+"V > .graphVertex").data(this.graphData.nodeValues(),function(e){return e.id()});o.enter().append("g").attr("class","graphVertex").style("opacity",1e-6).on("click.selectionBag",function(t){s._selection.click(t,e.event)}).on("click",function(t){s.vertex_click(t,e.event)}).on("dblclick",function(t){s.vertex_dblclick(t,e.event)}).on("mouseover",function(t){if(s._dragging)return;s.vertex_mouseover(e.select(this),t)}).on("mouseout",function(t){if(s._dragging)return;s.vertex_mouseout(e.select(this),t)}).each(u).transition().duration(750).style("opacity",1);var a=this.svgE.selectAll("#"+this._id+"E > .edge").data(this._showEdges?this.graphData.edgeValues():[],function(e){return e.id()});a.enter().append("g").attr("class","edge").style("opacity",1e-6).on("click",function(e){s.edge_click(e)}).on("mouseover",function(t){if(s._dragging)return;s.edge_mouseover(e.select(this),t)}).on("mouseout",function(t){if(s._dragging)return;s.edge_mouseout(e.select(this),t)}).each(f).transition().duration(750).style("opacity",1),o.each(l),a.each(c),o.exit().each(function(e){e.target(null)}).remove(),a.exit().each(function(e){e.target(null)}).remove(),this._renderCount++||(this.setZoom([0,0],1),this.layout(this.layout()))},u.prototype.getLayoutEngine=function(){switch(this._layout){case"Circle":return new s.Circle(this.graphData,this._size.width,this._size.height);case"ForceDirected":return new s.ForceDirected(this.graphData,this._size.width,this._size.height,!0);case"ForceDirected2":return new s.ForceDirected(this.graphData,this._size.width,this._size.height);case"Hierarchy":return new s.Hierarchy(this.graphData,this._size.width,this._size.height,this._hierarchyOptions)}return null},u.prototype.getNeighborMap=function(e){var t={},n={};if(e){var n=this.graphData.nodeEdges(e.id());for(var r=0;r<n.length;++r){var i=this.graphData.edge(n[r]);n[i.id()]=i,i._sourceVertex.id()!==e.id()&&(t[i._sourceVertex.id()]=i._sourceVertex),i._targetVertex.id()!==e.id()&&(t[i._targetVertex.id()]=i._targetVertex)}}return{vertices:t,edges:n}},u.prototype.highlightVerticies=function(e){var t=this,n=this.svgV.selectAll(".graphVertex");n.transition().duration(this.highlight.transition).each("end",function(t){e&&e[t.id()]&&t._parentElement.node()&&t._parentElement.node().parentNode&&t._parentElement.node().parentNode.appendChild(t._parentElement.node())}).style("opacity",function(n){return!e||e[n.id()]?1:t.highlight.opacity})},u.prototype.highlightEdges=function(e){var t=this,n=this.svgE.selectAll(".edge");n.style("stroke-width",function(n){return e&&e[n.id()]?t.highlight.edge:"1px"}).transition().duration(this.highlight.transition).style("opacity",function(n){return!e||e[n.id()]?1:t.highlight.opacity})},u.prototype.highlightVertex=function(e,t){if(this._highlightOnMouseOverVertex)if(t){var n=this.getNeighborMap(t);n.vertices[t.id()]=t,this.highlightVerticies(n.vertices),this.highlightEdges(n.edges)}else this.highlightVerticies(null),this.highlightEdges(null)},u.prototype.highlightEdge=function(e,t){if(this._highlightOnMouseOverEdge)if(t){var n={};n[t._sourceVertex.id()]=t._sourceVertex,n[t._targetVertex.id()]=t._targetVertex;var r={};r[t.id()]=t,this.highlightVerticies(n),this.highlightEdges(r)}else this.highlightVerticies(null),this.highlightEdges(null)},u.prototype.refreshIncidentEdges=function(e,t){var n=this;this.graphData.nodeEdges(e.id()).forEach(function(e){var r=n.graphData.edge(e);r.points([],!1,t)})},u.prototype.vertex_click=function(e){e._parentElement.node().parentNode.appendChild(e._parentElement.node()),n.prototype.vertex_click.apply(this,arguments)},u.prototype.vertex_dblclick=function(e){},u.prototype.vertex_mouseover=function(e,t){this.highlightVertex(e,t)},u.prototype.vertex_mouseout=function(e,t){this.highlightVertex(null,null)},u.prototype.edge_mouseover=function(e,t){this.highlightEdge(e,t)},u.prototype.edge_mouseout=function(e,t){this.highlightEdge(null,null)},u.prototype.addMarkers=function(e){e&&(this.defs.select("#"+this._id+"_arrowHead").remove(),this.defs.select("#"+this._id+"_circleFoot").remove(),this.defs.select("#"+this._id+"_circleHead").remove()),this.defs.append("marker").attr("class","marker").attr("id",this._id+"_arrowHead").attr("viewBox","0 0 10 10").attr("refX",10).attr("refY",5).attr("markerWidth",8).attr("markerHeight",8).attr("markerUnits","strokeWidth").attr("orient","auto").append("polyline").attr("points","0,0 10,5 0,10 1,5"),this.defs.append("marker").attr("class","marker").attr("id",this._id+"_circleFoot").attr("viewBox","0 0 10 10").attr("refX",1).attr("refY",5).attr("markerWidth",7).attr("markerHeight",7).attr("markerUnits","strokeWidth").attr("orient","auto").append("circle").attr("cx",5).attr("cy",5).attr("r",4),this.defs.append("marker").attr("class","marker").attr("id",this._id+"_circleHead").attr("viewBox","0 0 10 10").attr("refX",9).attr("refY",5).attr("markerWidth",7).attr("markerHeight",7).attr("markerUnits","strokeWidth").attr("orient","auto").append("circle").attr("cx",5).attr("cy",5).attr("r",4)},u});
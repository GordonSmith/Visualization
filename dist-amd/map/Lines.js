!function(t,e){"function"==typeof define&&define.amd?define(["d3","./Layer","css!./Lines"],e):t.map_Graph=e(t.d3,t.map_Layer)}(this,function(t,e){function a(){e.call(this)}return a.prototype=Object.create(e.prototype),a.prototype.constructor=a,a.prototype._class+=" map_Lines",a.prototype.publish("opacity",1,"number","Opacity",null,{tags:["Advanced"]}),a.prototype.data=function(t){var a=e.prototype.data.apply(this,arguments);return arguments.length&&(this.dataEdges=[],t.forEach(function(t){this.dataEdges.push({type:"LineString",coordinates:[[t[1],t[0]],[t[3],t[2]]]})},this)),a},a.prototype.layerEnter=function(a,r,s){e.prototype.layerEnter.apply(this,arguments),r.append("defs").append("marker").attr("class","marker").attr("id",this._id+"_arrowHead").attr("viewBox","0 0 10 10").attr("refX",10).attr("refY",5).attr("markerWidth",16).attr("markerHeight",16).attr("markerUnits","strokeWidth").attr("orient","auto").append("polyline").attr("points","0,0 10,5 0,10 1,5"),this._edgesTransform=r.append("g"),this.edgesPaths=t.select(null)},a.prototype.layerUpdate=function(t){e.prototype.layerUpdate.apply(this,arguments),this._edgesTransform.style("opacity",this.opacity()),this.edgesPaths=this._edgesTransform.selectAll(".dataEdge").data(this.visible()?this.dataEdges:[]),this.edgesPaths.enter().append("path").attr("class","dataEdge").attr("marker-end","url(#"+this._id+"_arrowHead)"),this.edgesPaths.attr("d",t._d3GeoPath),this.edgesPaths.exit().remove()},a.prototype.layerZoomed=function(t){e.prototype.layerZoomed.apply(this,arguments),this._edgesTransform.attr("transform","translate("+t._zoom.translate()+")scale("+t._zoom.scale()+")").style("stroke-width",.5/t._zoom.scale()+"px")},a});
!function(t,e){"function"==typeof define&&define.amd?define(["d3","../common/SVGWidget","../api/ITree","../common/Text","../common/FAChar","css!./SunburstPartition"],e):t.tree_SunburstPartition=e(t.d3,t.common_SVGWidget,t.api_ITree,t.common_Text,t.common_FAChar)}(this,function(t,e,i,a,n){function o(t){e.call(this),i.call(this)}return o.prototype=Object.create(e.prototype),o.prototype.constructor=o,o.prototype._class+=" tree_SunburstPartition",o.prototype["implements"](i.prototype),o.prototype.publish("paletteID","default","set","Palette ID",o.prototype._palette["switch"](),{tags:["Basic","Shared"]}),o.prototype.publish("useClonedPalette",!1,"boolean","Enable or disable using a cloned palette",null,{tags:["Intermediate","Shared"]}),o.prototype.root=function(t){return arguments.length?(this._root=t,this.svg&&this.svg.selectAll("path").transition().duration(750).attrTween("d",this.arcTweenFunc(this._root)),this):this._root||this.data()},o.prototype.data=function(){var t=e.prototype.data.apply(this,arguments);return arguments.length&&(this._resetRoot=!0),t},o.prototype.enter=function(e,i){var a=this;this.radius=Math.min(this.width(),this.height())/2,this._xScale=t.scale.linear().range([0,2*Math.PI]),this._yScale=t.scale.sqrt().range([0,this.radius]),this.partition=t.layout.partition().value(function(t){return void 0!==t.value?t.value:1}),this.arc=t.svg.arc().startAngle(function(t){return Math.max(0,Math.min(2*Math.PI,a._xScale(t.x)))}).endAngle(function(t){return Math.max(0,Math.min(2*Math.PI,a._xScale(t.x+t.dx)))}).innerRadius(function(t){return Math.max(0,a._yScale(t.y))}).outerRadius(function(t){return Math.max(0,a._yScale(t.y+t.dy))}),this.svg=i.append("g")},o.prototype.update=function(e,i){function a(e){t.event&&t.event.stopPropagation(),n.root(e)}var n=this;this._palette=this._palette["switch"](this.paletteID()),this.useClonedPalette()&&(this._palette=this._palette.cloneNotExists(this.paletteID()+"_"+this.id())),this.radius=Math.min(this.width(),this.height())/2,this._xScale.range([0,2*Math.PI]),this._yScale.range([0,this.radius]),this._dataNodes=this.partition.nodes(this.data());var o=this.svg.selectAll("path").data(this._dataNodes,function(t,e){return void 0!==t.id?t.id:e});o.enter().append("path").on("click",function(t){n.click(t)}).on("dblclick",a).append("title"),o.attr("d",this.arc).style("fill",function(t){return t.__viz_fill?t.__viz_fill:n._palette(t.label)}).style("stroke",function(t){return t.value>16?"white":"none"}).select("title").text(function(t){return t.label}),o.exit().remove(),this._resetRoot&&(this._resetRoot=!1,this.root(this._dataNodes[0]))},o.prototype.arcTweenFunc=function(e){var i=t.interpolate(this._xScale.domain(),[e.x,e.x+e.dx]),a=t.interpolate(this._yScale.domain(),[e.y,1]),n=t.interpolate(this._yScale.range(),[e.y?20:0,this.radius]),o=this;return function(t,e){return e?function(e){return o.arc(t)}:function(e){return o._xScale.domain(i(e)),o._yScale.domain(a(e)).range(n(e)),o.arc(t)}}},o});
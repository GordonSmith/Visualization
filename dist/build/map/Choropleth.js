(function(e,t){typeof define=="function"&&define.amd?define(["d3/d3","../common/SVGWidget","./IChoropleth","css!./Choropleth"],t):e.Map_Choropleth=t(e.d3,e.SVGWidget,e.Map_IChoropleth)})(this,function(e,t,n){function r(){t.call(this),n.call(this),this._class="map_Choropleth",this._dataMap={},this._dataMinWeight=0,this._dataMaxWeight=0}return r.prototype=Object.create(t.prototype),r.prototype.implements(n.prototype),r.prototype.publish("paletteID","YlOrRd","set","Palette ID",r.prototype._palette.switch()),r.prototype.data=function(e){var n=t.prototype.data.apply(this,arguments);if(arguments.length){this._dataMap={},this._dataMinWeight=null,this._dataMaxWeight=null;var r=this;this._data.forEach(function(e){r._dataMap[e[0]]=e;if(!r._dataMinWeight||e[1]<r._dataMinWeight)r._dataMinWeight=e[1];if(!r._dataMaxWeight||e[1]>r._dataMaxWeight)r._dataMaxWeight=e[1]})}return n},r.prototype.size=function(e){var n=t.prototype.size.apply(this,arguments);return arguments.length&&this._svgZoom&&this._svgZoom.attr("x",-this._size.width/2).attr("y",-this._size.height/2).attr("width",this._size.width).attr("height",this._size.height),n},r.prototype.projection=function(t){if(!arguments.length)return this._projection;this._projection=t;switch(this._projection){case"albersUsaPr":this.d3Projection=this.albersUsaPr();break;case"orthographic":this.d3Projection=e.geo.orthographic().clipAngle(90);break;case"mercator":this.d3Projection=e.geo.mercator()}return this.d3Path=e.geo.path().projection(this.d3Projection),this},r.prototype.render=function(){return t.prototype.render.apply(this,arguments),this._renderCount===1&&this.zoomToFit(),this},r.prototype.enter=function(t,n){var r=this;this._svgZoom=n.append("rect").attr("class","zoom").attr("x",-this._size.width/2).attr("y",-this._size.height/2).attr("width",this._size.width).attr("height",this._size.height).on("dblclick",function(t){e.event.stopPropagation(),r.zoomToFit(null,750)});var i=this._parentElement.insert("defs",":first-child"),s=i.append("pattern").attr("id","hash").attr("patternUnits","userSpaceOnUse").attr("width","10").attr("height","10").attr("x",0).attr("y",0).append("g");s.append("rect").attr("class","noFill").attr("x",0).attr("y",0).attr("width",5).attr("height",5),s.append("rect").attr("class","noFill").attr("x",5).attr("y",5).attr("width",5).attr("height",5),this._svg=n.append("g")},r.prototype.update=function(e,t){this._palette=this._palette.switch(this._paletteID)},r.prototype.albersUsaPr=function(){function h(e){var t=e[0],n=e[1];return o=null,(a(t,n),o)||(f(t,n),o)||(l(t,n),o)||(c(t,n),o),o}var t=1e-6,n=e.geo.albers(),r=e.geo.conicEqualArea().rotate([154,0]).center([-2,58.5]).parallels([55,65]),i=e.geo.conicEqualArea().rotate([157,0]).center([-3,19.9]).parallels([8,18]),s=e.geo.conicEqualArea().rotate([66,0]).center([0,18]).parallels([8,18]),o,u={point:function(e,t){o=[e,t]}},a,f,l,c;return h.invert=function(e){var t=n.scale(),o=n.translate(),u=(e[0]-o[0])/t,a=(e[1]-o[1])/t;return(a>=.12&&a<.234&&u>=-0.425&&u<-0.214?r:a>=.166&&a<.234&&u>=-0.214&&u<-0.115?i:a>=.204&&a<.234&&u>=.32&&u<.38?s:n).invert(e)},h.stream=function(e){var t=n.stream(e),o=r.stream(e),u=i.stream(e),a=s.stream(e);return{point:function(e,n){t.point(e,n),o.point(e,n),u.point(e,n),a.point(e,n)},sphere:function(){t.sphere(),o.sphere(),u.sphere(),a.sphere()},lineStart:function(){t.lineStart(),o.lineStart(),u.lineStart(),a.lineStart()},lineEnd:function(){t.lineEnd(),o.lineEnd(),u.lineEnd(),a.lineEnd()},polygonStart:function(){t.polygonStart(),o.polygonStart(),u.polygonStart(),a.polygonStart()},polygonEnd:function(){t.polygonEnd(),o.polygonEnd(),u.polygonEnd(),a.polygonEnd()}}},h.precision=function(e){return arguments.length?(n.precision(e),r.precision(e),i.precision(e),s.precision(e),h):n.precision()},h.scale=function(e){return arguments.length?(n.scale(e),r.scale(e*.35),i.scale(e),s.scale(e),h.translate(n.translate())):n.scale()},h.translate=function(e){if(!arguments.length)return n.translate();var o=n.scale(),p=+e[0],d=+e[1];return a=n.translate(e).clipExtent([[p-.455*o,d-.238*o],[p+.455*o,d+.238*o]]).stream(u).point,f=r.translate([p-.307*o,d+.201*o]).clipExtent([[p-.425*o+t,d+.12*o+t],[p-.214*o-t,d+.234*o-t]]).stream(u).point,l=i.translate([p-.205*o,d+.212*o]).clipExtent([[p-.214*o+t,d+.166*o+t],[p-.115*o-t,d+.234*o-t]]).stream(u).point,c=s.translate([p+.35*o,d+.224*o]).clipExtent([[p+.32*o,d+.204*o],[p+.38*o,d+.234*o]]).stream(u).point,h},h.scale(1070)},r.prototype.zoomToFit=function(e,t,n){var n=n||.9,r=e?e.getBBox():this._svg.node().getBBox(),i=r.x+r.width/2,s=r.y+r.height/2,o=n/Math.max(r.width/this.width(),r.height/this.height()),u=[-o*i,-o*s];(t?this._svg.transition().duration(t):this._svg).attr("transform","translate("+u+")scale("+o+")")},r});
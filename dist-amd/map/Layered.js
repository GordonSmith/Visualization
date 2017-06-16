!function(t,e){"function"==typeof define&&define.amd?define(["d3","topojson","../common/SVGWidget","./Utility","css!./Layered"],e):t.map_Layered=e(t.d3,t.topojson,t.common_SVGWidget,t.map_Utility)}(this,function(t,e,o,r){function n(){o.call(this),this._drawStartPos="origin",this.projection("mercator")}var i=.25,a=2048/Math.PI;return n.prototype=Object.create(o.prototype),n.prototype.constructor=n,n.prototype._class+=" map_Layered",n.prototype.publish("projection",null,"set","Map projection type",["albersUsa","albersUsaPr","azimuthalEqualArea","azimuthalEquidistant","conicEqualArea","conicConformal","conicEquidistant","equirectangular","gnomonic","mercator","orthographic","stereographic","transverseMercator"]),n.prototype.publish("centerLat",0,"number","Center Latitude",null,{tags:["Basic"]}),n.prototype.publish("centerLong",0,"number","Center Longtitude",null,{tags:["Basic"]}),n.prototype.publish("zoom",1,"number","Zoom Level",null,{tags:["Basic"]}),n.prototype.publish("autoScaleMode","all","set","Auto Scale",["none","all"],{tags:["Basic"]}),n.prototype.publish("layers",[],"widgetArray","Layers"),n.prototype.data=function(t){var e=o.prototype.data.apply(this,arguments);return arguments.length&&(this._autoScaleOnNextRender=!0),e},n.prototype.projection_orig=n.prototype.projection,n.prototype.projection=function(e){var o=n.prototype.projection_orig.apply(this,arguments);if(arguments.length){switch(this._d3GeoProjection=t.geo[e]().scale(a).translate([0,0]),e){case"orthographic":this._d3GeoProjection.clipAngle(90).rotate([0,0])}this._d3GeoPath=t.geo.path().projection(this._d3GeoProjection),this._autoScaleOnNextRender=!0}return o},n.prototype.size=function(t){var e=o.prototype.size.apply(this,arguments);return arguments.length&&(delete this._prevCenterLat,delete this._prevCenterLong),e},n.prototype.enter=function(e,r){o.prototype.enter.apply(this,arguments);var n=this;this._zoom=t.behavior.zoom().scaleExtent([.25*i,131072*i]).on("zoomstart",function(t){n._zoomstart_translate=n._zoom.translate(),n._zoomstart_scale=n._zoom.scale()}).on("zoom",function(){if(t.event&&t.event.sourceEvent&&t.event.sourceEvent.ctrlKey&&"mousemove"===t.event.sourceEvent.type)return void n.render();n.zoomed();var e=n.width()/2,o=n.height()/2,r=n.invert(e,o);n.centerLong(r[0]),n.centerLat(r[1]),n.zoom(n._zoom.scale()/i),n._prevCenterLong=n.centerLong(),n._prevCenterLat=n.centerLat(),n._prevZoom=n.zoom()}).on("zoomend",function(){}),this._zoomGrab=r.append("rect").attr("class","background"),this._layersTarget=r.append("g").attr("class","layersTarget"),r.call(this._zoom)},n.prototype.update=function(e,r){if(o.prototype.update.apply(this,arguments),this._prevCenterLat!==this.centerLat()||this._prevCenterLong!==this.centerLong()||this._prevZoom!==this.zoom()){var n=t.geo[this.projection()]().scale(this.zoom()*i*a).translate([this.width()/2,this.height()/2]),s=n([this.centerLong(),this.centerLat()])||[this.width()/2,this.height()/2];this._zoom.scale(this.zoom()*i).translate([this.width()-s[0],this.height()-s[1]]),this._prevCenterLat=this.centerLat(),this._prevCenterLong=this.centerLong(),this._prevZoom=this.zoom()}this._zoomGrab.attr("width",this.width()).attr("height",this.height());var h=this._layersTarget.selectAll(".layerContainer").data(this.layers().filter(function(t){return t.visible()}),function(t){return t.id()}),c=this;h.enter().append("g").attr("id",function(t){return t.id()}).attr("class","layerContainer").each(function(e){e._svgElement=t.select(this),e._domElement=c._parentOverlay.append("div"),e.layerEnter(c,e._svgElement,e._domElement)}),h.each(function(t){t.layerUpdate(c)}),h.exit().each(function(t){t.layerExit(c),t._domElement.remove()}).remove(),h.order(),this.zoomed()},n.prototype.exit=function(t,e){o.prototype.exit.apply(this,arguments)},n.prototype.zoomed=function(){var t=this._layersTarget.selectAll(".layerContainer"),e=this;t.each(function(t){t.layerZoomed(e)})},n.prototype.render=function(t){var e=this,r=o.prototype.render.call(this,function(o){e._layersTarget&&(e._renderCount&&e._autoScaleOnNextRender||e._prevAutoScaleMode!==e.autoScaleMode())?(e._prevAutoScaleMode=e.autoScaleMode(),e._autoScaleOnNextRender=!1,setTimeout(function(){e.autoScale(),e.autoScale(),t&&t(o)},0)):t&&t(o)});return r},n.prototype.project=function(t,e){t>=90?t=89:-90>=t&&(t=-89);var o=this._d3GeoProjection([e,t]);return o&&(o[0]*=this._zoom.scale(),o[1]*=this._zoom.scale(),o[0]+=this._zoom.translate()[0],o[1]+=this._zoom.translate()[1]),o},n.prototype.invert=function(t,e){return t-=this._zoom.translate()[0],e-=this._zoom.translate()[1],t/=this._zoom.scale(),e/=this._zoom.scale(),this._d3GeoProjection.invert([t,e])},n.prototype.getBounds=function(){var t=this._layersTarget.node().getBBox();return{x:t.x,y:t.y,width:t.width,height:t.height}},n.prototype.autoScale=function(){switch(this.autoScaleMode()){case"none":return;case"all":this.shrinkToFit(this.getBounds())}},n.prototype.shrinkToFit=function(t){if(t.width&&t.height){var e=this.width(),o=this.height(),r=this._zoom.translate(),n=this._zoom.scale();t.x+=t.width/2,t.y+=t.height/2,r[0]-=t.x-e/2,r[1]-=t.y-o/2;var i=n*Math.min(e/t.width,o/t.height);this._zoom.translate(r).scale(i).event(this._layersTarget)}else console.log("Layered.prototype.shrinkToFit - invalid rect:  "+t)},n});
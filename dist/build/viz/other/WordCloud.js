(function(e,t){typeof define=="function"&&define.amd?define(["../common/SVGWidget","./IWordCloud","d3/d3","css!./WordCloud"],t):e.other_WordCloud=t(e.common_SVGWidget,e.other_IWordCloud,e.d3)})(this,function(e,t,n){function r(){e.call(this),t.call(this),this._class="other_WordCloud"}return r.prototype=Object.create(e.prototype),r.prototype.implements(t.prototype),r.prototype.publish("padding",1,"number","Padding"),r.prototype.publish("font","Verdana","string","Font Name"),r.prototype.publish("fontSizeFrom",6,"number","Font Size From"),r.prototype.publish("fontSizeTo",24,"number","Font Size To"),r.prototype.publish("angleFrom",-60,"number","Angle From"),r.prototype.publish("angleTo",60,"number","Angle To"),r.prototype.publish("angleCount",5,"number","Angle Count"),r.prototype.data=function(t){var n=e.prototype.data.apply(this,arguments);return arguments.length&&(this._vizData=t.map(function(e){var t={};for(var n in e)t["__viz_"+n]=e[n];return t})),n},r.prototype.enter=function(e,t){this.cloud=n.layout.cloud().font(this._font).padding(this._padding),this.svg=t.append("g")},r.prototype.update=function(e,t){function u(e,t){var i=n.scale.category20(),o=r.svg.selectAll("text").data(e,function(e){return e.__viz_0?e.__viz_0.toLowerCase():""});o.transition().duration(1e3).attr("transform",function(e){return"translate("+[e.x,e.y]+")rotate("+e.rotate+")"}).style("font-size",function(e){return s(e.__viz_1)+"px"}).style("opacity",1),o.enter().append("text").attr("text-anchor","middle").attr("transform",function(e){return"translate("+[e.x,e.y]+")rotate("+e.rotate+")"}).style("font-size",function(e){return s(e.__viz_1)+"px"}).style("font-family",function(e){return e.font}).style("fill",function(e){return i(e.__viz_0?e.__viz_0.toLowerCase():"")}).text(function(e){return e.__viz_0}).on("click",function(e){r.click({label:e.__viz_0,weight:e.__viz_1})}).style("opacity",1e-6).transition().duration(1e3).style("opacity",1),o.exit().transition().duration(1e3).style("opacity",1e-4).remove();if(t){var u=r.width(),a=r.height(),f=t[1].x-t[0].x,l=t[1].y-t[0].y,c=.9/Math.max(f/u,l/a);r.svg.transition().delay(1e3).duration(750).attr("transform","scale("+c+")")}}var r=this,i=n.extent(this._vizData,function(e){return e.__viz_1}),s=n.scale.log().domain(i).range([this._fontSizeFrom,this._fontSizeTo]),o=n.scale.linear().domain([0,r._angleCount-1]).range([r._angleFrom,r._angleTo]);this.cloud.size([this.width(),this.height()]).words(this._vizData).rotate(function(){return o(~~(Math.random()*r._angleCount))}).fontSize(function(e){return s(e.__viz_1)}).on("end",u).start()},r.prototype.render=function(t){var n=this;return require(["d3-cloud/d3.layout.cloud"],function(r){e.prototype.render.call(n,t)}),this},r});
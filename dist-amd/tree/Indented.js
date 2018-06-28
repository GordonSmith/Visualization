!function(t,e){"function"==typeof define&&define.amd?define(["d3","../common/SVGZoomWidget","../common/PropertyExt","../api/ITree","../common/Utility","css!./Indented"],e):t.tree_Indented=e(t.d3,t.common_SVGZoomWidget,t.common_PropertyExt,t.api_ITree,t.common_Utility)}(this,function(t,e,n,r,i){function o(t){n.call(this),this._owner=t}function a(n){e.call(this),r.call(this),i.SimpleSelectionMixin.call(this),this._drawStartPos="origin",this._d3LayoutTree=t.layout.tree(),this._d3Diagonal=t.svg.diagonal().projection(function(t){return[t.y,t.x]})}function s(t,e){e=e||"";var n={id:e,label:"",attributes:{},children:[]};if(n.label=t.nodeName,1===t.nodeType){if(t.attributes.length>0)for(var r=0;r<t.attributes.length;r++){var i=t.attributes.item(r);n.attributes[i.nodeName]=i.nodeValue}}else 3===t.nodeType&&(n.label=t.nodeValue);if(t.hasChildNodes())for(var o=0;o<t.childNodes.length;o++){var a=t.childNodes.item(o),l=s(a,e+"["+n.children.length+"]");n.children.push(l)}return n}return o.prototype=Object.create(n.prototype),o.prototype.constructor=o,o.prototype._class+=" tree_Dendrogram.Column",o.prototype.publish("column",null,"set","Field",function(){return this._owner?this._owner.columns():[]},{optional:!0}),a.prototype=Object.create(e.prototype),a.prototype.constructor=a,a.prototype._class+=" tree_Indented",a.prototype["implements"](r.prototype),a.prototype.mixin(i.SimpleSelectionMixin),a.prototype.Column=o,a.prototype.publish("xmlColumn",null,"set","Field",function(){return this.columns()},{optional:!0}),a.prototype.publish("mappings",[],"propertyArray","Source Columns",null,{autoExpand:o,disable:function(t){return t.xmlColumn_exists()}}),a.prototype.publish("barHeight",16,"number","Bar height"),a.prototype.xmlToData=function(t,e){if(DOMParser){var n=new DOMParser,r=n.parseFromString(t,"text/xml");return s(r,e).children[0]}return[]},a.prototype.xml=function(t){return arguments.length?(this._xml=t,this.data(this.xmlToData(this._xml)),this):this._xml},a.prototype.IndentedData=function(){function t(e){if(e.values instanceof Array){var n=e.values.filter(function(t){return!(t instanceof Array)}).map(function(e){return t(e)}),r={label:e.key};return n.length?r.children=n:r.size=22,r}return{label:e.key,size:e.values.aggregate,origRows:e.values}}if(this.xmlColumn_exists()){var e=this.columns().indexOf(this.xmlColumn()),n={label:this.xmlColumn(),children:this.data().map(function(t,n){return this.xmlToData(t[e],"["+n+"]")},this)};return 1===n.children.length?n.children[0]:n}if(!this.mappings().filter(function(t){return t.column()}).length)return this.data();var r=this._db.rollupView(this.mappings().map(function(t){return t.column()})),i={key:"root",values:r.entries()};return t(i)},a.prototype.enter=function(t,n){e.prototype.enter.apply(this,arguments),this._svgLinks=this._renderElement.append("g"),this._svgNodes=this._renderElement.append("g"),this._selection.widgetElement(this._svgNodes)},a.prototype.update=function(n,r,i){function o(t){return t._children?"#3182bd":t.children?"#c6dbef":"#fd8d3c"}e.prototype.update.apply(this,arguments);var a=this;this._d3LayoutTree.nodeSize([0,this.barHeight()]);var s=this._db.dataChecksum();this._prevDataChecksum!==s&&(this._treeData=this.IndentedData(),this._prevDataChecksum=s);var l=this._d3LayoutTree.nodes(this._treeData),u=this._d3LayoutTree.links(l);l.forEach(function(t,e){t.x=e*this.barHeight()},this);var h=this.barHeight()-4,c=this._renderCount?500:0,d=this._svgLinks.selectAll(".link").data(u,function(t,e){return t.source.id+"->"+t.target.id});d.enter().append("path").attr("class","link").attr("d",this._d3Diagonal),d.transition().duration(c).attr("d",this._d3Diagonal),d.exit().remove();var p=this._svgNodes.selectAll(".node").data(l,function(t,e){return t.id});p.transition().duration(c).attr("transform",function(t){return"translate("+t.y+","+t.x+")"}),p.enter().append("g").attr("class","node").attr("transform",function(t){return"translate("+t.y+","+t.x+")"}).call(this._selection.enter.bind(this._selection)).each(function(e,n){var r=t.select(this);r.append("rect").attr("height",h).attr("width",h).on("click",function(t){t.children?(t._children=t.children,t.children=null):(t.children=t._children,t._children=null),t.depth>0,a.lazyRender()}),r.append("text")}).style("opacity",0).transition().style("opacity",1),p.select("rect").attr("x",-h/2).attr("y",-h/2).style("fill",o),p.select("text").attr("dx",h/2+4+"px").attr("dy","0.33em").text(function(t){return t.label}),p.exit().transition().style("opacity",0).remove(),this._renderCount||a.zoomToFit()},a});
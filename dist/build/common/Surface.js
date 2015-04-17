(function(e,t){typeof define=="function"&&define.amd?define(["./SVGWidget","./Icon","./Shape","./Text","./FAChar","./Menu","css!./Surface"],t):e.Surface=t(e.SVGWidget,e.Icon,e.Shape,e.Text,e.FAChar,e.Menu)})(this,function(e,t,n,r,i,s){function o(){e.call(this),this._class="common_Surface",this._menuPadding=2,this._icon=(new t).faChar("").padding_percent(50),this._container=(new n).class("container").shape("rect"),this._titleRect=(new n).class("title").shape("rect"),this._text=(new r).class("title"),this._menu=(new s).padding_percent(0);var i=this;this._menu.preShowMenu=function(){i._content&&i._content.hasOverlay()&&i._content.visible(!1)},this._menu.postHideMenu=function(){i._content&&i._content.hasOverlay()&&i._content.visible(!0)},this._showContent=!0,this._content=null}return o.prototype=Object.create(e.prototype),o.prototype.publish("show_title",!0,"boolean","Show Title"),o.prototype.publish("title","","string","Title"),o.prototype.publishProxy("title_font_size","_text","font_size"),o.prototype.publish("show_icon",!0,"boolean","Show Title"),o.prototype.publishProxy("icon_faChar","_icon","faChar"),o.prototype.publishProxy("icon_shape","_icon","shape"),o.prototype.publish("content",null,"widget","Content"),o.prototype.menu=function(e){return arguments.length?(this._menu.data(e),this):this._menu.data()},o.prototype.showContent=function(e){return arguments.length?(this._showContent=e,this._content&&this._content.visible(this._showContent),this):this._showContent},o.prototype.content=function(e){if(!arguments.length)return this._content;this._content=e;switch(this._content.class()){case"bar":this.icon_faChar("");break;case"bubble":this.icon_faChar("");break;case"pie":this.icon_faChar("");break;case"table":this.icon_faChar("")}return this},o.prototype.testData=function(){return this.title("Hello and welcome!"),this.menu(["aaa","bbb","ccc"]),this},o.prototype.enter=function(t,n){e.prototype.enter.apply(this,arguments);var r=n.append("g").attr("class","frame"),i=r.node();this._clipRect=r.append("defs").append("clipPath").attr("id",this.id()+"_clip").append("rect").attr("x",0).attr("y",0).attr("width",this._size.width).attr("height",this._size.height),this._titleRect.target(i).render().display(this._show_title&&this._show_icon),this._icon.target(i).render();var s=!1;this._menu.target(t),this._text.target(i),this._container.target(i)},o.prototype.update=function(t,n){e.prototype.update.apply(this,arguments),this._icon.display(this._show_title&&this._show_icon).render(),this._menu.render(),this._text.text(this._title).display(this._show_title).render();var r=this._show_icon?this._icon.getBBox(!0):{width:0,height:0},i=this._text.getBBox(!0),s=this._menu.getBBox(!0),o=Math.max(r.height,i.height,s.height),u=(-this._size.height+o)/2,a=Math.max(i.height,s.height),f=o<=a?0:(o-a)/2,l=f;this._titleRect.pos({x:l,y:u}).width(this._size.width-l*2).height(a).display(this._show_title).render(),this._icon.move({x:-this._size.width/2+r.width/2,y:u}),this._menu.move({x:this._size.width/2-s.width/2-this._menuPadding,y:u}),this._text.move({x:(r.width/2-s.width/2)/2,y:u}),this._show_title?this._container.pos({x:l/2,y:o/2-f/2}).width(this._size.width-l).height(this._size.height-o+f).render():this._container.pos({x:0,y:0}).width(this._size.width).height(this._size.height).render();if(this._showContent){var c=l,h=o-f,p=this,d=n.selectAll(".content").data(this._content?[this._content]:[],function(e){return e._id});d.enter().append("g").attr("class","content").attr("clip-path","url(#"+this.id()+"_clip)").each(function(e){e.target(this)}),d.each(function(e){var t={left:4,top:4,right:4,bottom:4};e.pos({x:c/2,y:h/2}).size({width:p._size.width-c-(t.left+t.right),height:p._size.height-h-(t.top+t.bottom)})}),this._content&&this._clipRect.attr("x",-this._size.width/2+c).attr("y",-this._size.height/2+h).attr("width",this._size.width-c).attr("height",this._size.height-h),d.exit().transition().each(function(e){e.target(null)}).remove()}this._menu.element().node().parentNode.appendChild(this._menu.element().node())},o.prototype.exit=function(t,n){this._content&&this._content.target(null),e.prototype.exit.apply(this,arguments)},o.prototype.render=function(t){this._content||e.prototype.render.apply(this,arguments),e.prototype.render.call(this);var n=this;return this._content&&this._content.render(function(e){t&&t(n)}),this},o.prototype.intersection=function(e,t){var n=[],r=this._icon.intersection(e,t,this._pos);r&&n.push({i:r,d:this.distance(r,t)});var i=this._titleRect.intersection(e,t);i&&n.push({i:i,d:this.distance(i,t)});var s=this._container.intersection(e,t);s&&n.push({i:s,d:this.distance(s,t)});var o=null;return n.forEach(function(e){if(o===null||o.d>e.d)o=e}),o&&o.i?o.i:null},o});
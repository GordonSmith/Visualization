!function(t,e){"function"==typeof define&&define.amd?define(["d3","../common/HTMLWidget","amcharts-pie","../api/I2DChart","require"],e):t.amchart_Pie=e(t.d3,t.common_HTMLWidget,t.AmCharts,t.api_I2DChart,t.require)}(this,function(t,e,i,a,s){function o(){e.call(this),this._tag="div",this._chart={},this._selected=null,this._selections=[],this._dataUpdated=0,this._prevDataUpdated=-1,this._columnsUpdated=0,this._prevColumnsUpdated=-1}return o.prototype=Object.create(e.prototype),o.prototype.constructor=o,o.prototype._class+=" amchart_Pie",o.prototype["implements"](a.prototype),o.prototype.publish("paletteID","default","set","Palette ID",o.prototype._palette["switch"](),{tags:["Basic","Shared"]}),o.prototype.publish("fontSize",11,"number","Font Size",null,{tags:["Basic","Shared"]}),o.prototype.publish("fontFamily","Verdana","string","Font Name",null,{tags:["Basic","Shared","Shared"]}),o.prototype.publish("fontColor","#000000","html-color","Font Color",null,{tags:["Basic","Shared"]}),o.prototype.publish("Depth3D",0,"number","3D Depth (px)",null,{tags:["Basic"]}),o.prototype.publish("Angle3D",0,"number","3D Angle (Deg)",null,{tags:["Basic"]}),o.prototype.publish("marginLeft",0,"number","Margin (Left)",null,{tags:["Intermediate"]}),o.prototype.publish("marginRight",0,"number","Margin (Right)",null,{tags:["Intermediate"]}),o.prototype.publish("marginTop",0,"number","Margin (Top)",null,{tags:["Intermediate"]}),o.prototype.publish("marginBottom",0,"number","Margin (Bottom)",null,{tags:["Intermediate"]}),o.prototype.publish("reverseDataSorting",!1,"boolean","Reverse Data Sorting",null,{tags:["Intermediate"]}),o.prototype.publish("holePercent",0,"number","Hole Size (Percent)",null,{tags:["Basic"]}),o.prototype.publish("radius",null,"number","Radius",null,{tags:["Basic"]}),o.prototype.publish("pieAlpha",[],"array","Individual Alpha per Slice",null,{tags:["Private"]}),o.prototype.publish("labelPosition","outside","set","Label Position",["inside","outside"],{tags:["Intermediate"]}),o.prototype.publish("useClonedPalette",!1,"boolean","Enable or disable using a cloned palette",null,{tags:["Intermediate","Shared"]}),o.prototype.publish("selectionMode","simple","set","Selection Mode",["simple","multi"],{tags:["Intermediate"]}),o.prototype.publish("selectionColor","#f00","html-color","Font Color",null,{tags:["Basic"]}),o.prototype.calcRadius=function(t){return Math.min(this._size.width,this._size.height)/2-2},o.prototype.updateChartOptions=function(){this._chart.type="pie",this._chart.labelsEnabled=!0,"inside"===this.labelPosition()?(this._chart.radius="50%",this._chart.labelRadius=-40,this._chart.pullOutRadius="20%"):(this._chart.radius=this.calcRadius(),this._chart.labelRadius=20,this._chart.pullOutRadius="20%"),this._chart.labelFunction=function(t){return t.title},this._chart.marginRight=this.marginRight(),this._chart.marginLeft=this.marginLeft(),this._chart.marginTop=this.marginTop(),this._chart.marginBottom=this.marginBottom(),this._chart.depth3D=this.Depth3D(),this._chart.angle=this.Angle3D(),this._chart.innerRadius=this.holePercent()+"%",this._chart.fontFamily=this.fontFamily(),this._chart.fontSize=this.fontSize(),this._chart.fontSize=this.fontSize(),this._chart.color=this.fontColor(),this._chart.titleField=this.columns()[0],this._chart.valueField=this.columns()[1];var t;return t=this.reverseDataSorting()?function(t,e){return t[1]<e[1]?1:-1}:function(t,e){return t[1]>e[1]?1:-1},this.data().sort(t),this._chart.colorField="sliceColor",(this._dataUpdated>this._prevDataUpdated||this._columnsUpdated>this._prevColumnsUpdated)&&(this._chart.dataProvider=this.formatData(this.data())),this._prevDataUpdated=this._dataUpdated,this._prevColumnsUpdated=this._columnsUpdated,this._chart.colors=this.data().map(function(t){return this._palette(t[0])},this),this._chart.pullOutOnlyOne="simple"===this.selectionMode(),this.pieAlpha().forEach(function(t,e){"undefined"==typeof this._chart.chartData[e]&&(this._chart.chartData[e]={}),this._chart.chartData[e].alpha=t},this),this._chart},o.prototype.formatData=function(t){var e=[],i=this;return t.forEach(function(t){var a={};i.columns().forEach(function(e,i){a[e]=t[i]}),e.push(a)}),e},o.prototype.enter=function(t,a){e.prototype.enter.apply(this,arguments);var o=this,r={type:"pie",addClassNames:!0,theme:"none"};"function"==typeof define&&define.amd&&(r.pathToImages=s.toUrl("amcharts-images")),this._chart=i.makeChart(t,r),this._chart.addListener("clickSlice",function(t){var e=t.chart.colorField,i=t.dataItem.dataContext;null!==i[e]&&void 0!==i[e]?(delete i[e],"simple"===o.selectionMode()&&(null!==o._selected&&delete o._selected.data[o._selected.field],o._selected=null)):(i[e]=o.selectionColor(),"simple"===o.selectionMode()&&(null!==o._selected&&delete o._selected.data[o._selected.field],o._selected={field:e,data:i,cIdx:1,dIdx:t.dataItem.index},o._selections.push(o._selected))),t.chart.validateData(),o.click(o.rowToObj(o.data()[t.dataItem.index]),o.columns()[1],null!==o._selected)})},o.prototype.update=function(t,e){this._palette=this._palette["switch"](this.paletteID()),this.useClonedPalette()&&(this._palette=this._palette.cloneNotExists(this.paletteID()+"_"+this.id())),t.style.width=this.size().width+"px",t.style.height=this.size().height+"px",this.updateChartOptions(),this._chart.validateNow(),this._chart.validateData()},o.prototype.render=function(t){return e.prototype.render.apply(this,arguments)},o.prototype.postUpdate=function(e,i){var a=this,s=a._element.select("svg").node().getBoundingClientRect();this.d3LabelSelection=i.selectAll(".amcharts-pie-label");var o=[],r=[],l=[],h=[];this.d3LabelSelection.each(function(e,i){var a=t.select(this).node().getBoundingClientRect(),n=a.top;n<s.top&&l.push(n-s.top);var p=a.bottom;p>s.bottom&&h.push(s.bottom-n);var c=a.right;c>s.right&&r.push(s.right-c);var d=a.left;d<s.left&&o.push(d-s.left)});var n=l.length?t.min(l):0,p=h.length?t.min(h):0,c=r.length?t.min(r):0,d=o.length?t.min(o):0,u=0;0>n&&(u+=n),0>p&&(u+=p),0>c&&(u+=c),0>d&&(u+=d),this.calcRadius()+u-20<this.calcRadius()&&(this._chart.radius=this.calcRadius()+u-20,this._chart.validateNow())},o.prototype.data=function(t){return arguments.length&&this._dataUpdated++,e.prototype.data.apply(this,arguments)},o.prototype.columns=function(t){return arguments.length&&this._columnsUpdated++,e.prototype.columns.apply(this,arguments)},o});
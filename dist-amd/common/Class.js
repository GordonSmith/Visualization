!function(t,o){"function"==typeof define&&define.amd?define([],o):t.common_Class=o()}(this,function(){function t(){}return t.prototype.constructor=t,t.prototype._class="common_Class",t.prototype["class"]=function(t){return arguments.length?(this._class=t,this):this._class},t.prototype.classID=function(){return this._class.split(" ").pop()},t.prototype["implements"]=function(t){for(var o in t)t.hasOwnProperty(o)&&(void 0===this[o]?this[o]=t[o]:window.__hpcc_debug&&console.log("Duplicate member:  "+o))},t.prototype.mixin=function(t){this["implements"](t.prototype),t.prototype.hasOwnProperty("_class")&&(this._class+=" "+t.prototype._class.split(" ").pop())},t.prototype.overrideMethod=function(t,o){if(void 0===this[t])throw"Method:  "+t+" does not exist.";var s=this[t];return this[t]=function(){return o(s,arguments)},this},t});
(function(e,t){typeof define=="function"&&define.amd?define([],t):e.IMenu=t()})(this,function(){function e(){}return e.prototype.testData=function(){var e=["This","is a","list","of some text."];return this.data(e),this},e.prototype.click=function(e){console.log("Click:  "+e)},e.prototype.preShowMenu=function(){console.log("preShowMenu")},e.prototype.postHideMenu=function(e){console.log("postHideMenu")},e});
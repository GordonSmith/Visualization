(function(e,t){typeof define=="function"&&define.amd?define([],t):e.IList=t()})(this,function(){function e(){}return e.prototype.testData=function(){var e=["This","is a","list","of some text."];return this.data(e),this},e.prototype.click=function(e){console.log("Click:  "+e)},e});
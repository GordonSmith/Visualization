var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@hpcc-js/common", "marked"], factory);
    }
})(function (require, exports) {
    "use strict";
    var __syncRequire = typeof module === "object" && typeof module.exports === "object";
    Object.defineProperty(exports, "__esModule", { value: true });
    var common_1 = require("@hpcc-js/common");
    var marked = require("marked");
    var PublishedProperties = /** @class */ (function (_super) {
        __extends(PublishedProperties, _super);
        function PublishedProperties() {
            return _super.call(this) || this;
        }
        PublishedProperties.prototype.infostring = function () {
            return this.data()[0][0];
        };
        PublishedProperties.prototype.text = function () {
            return this.data()[0][1];
        };
        PublishedProperties.prototype.parseClassID = function (classID) {
            var _a = classID.split("_"), moduleName = _a[0], className = _a[1];
            return ["@hpcc-js/" + moduleName, className];
        };
        PublishedProperties.prototype.extends = function (w) {
            var classParts = w.class().split(" ");
            classParts.pop();
            return this.parseClassID(classParts.pop());
        };
        PublishedProperties.prototype.update = function (domNode, element) {
            var _this = this;
            _super.prototype.update.call(this, domNode, element);
            var _a = this.infostring().split(":"), module = _a[0], widget = _a[1];
            (__syncRequire ? Promise.resolve().then(function () { return require(module); }) : new Promise(function (resolve_1, reject_1) { require([module], resolve_1, reject_1); })).then(function (mod) {
                var md = [];
                var w = new mod[widget]();
                var derivedFrom = _this.extends(w);
                md.push("Derived from:  " + derivedFrom[1] + " (" + derivedFrom[0] + ")\n");
                var pp = w.publishedProperties(false, true);
                pp.forEach(function (meta) {
                    md.push("### " + meta.id + "\n");
                    md.push("_" + meta.description + "_\n");
                    md.push("* **type**: " + meta.type);
                    md.push("* **optional**: " + !!meta.ext.optional);
                    md.push("* **default**: " + JSON.stringify(meta.defaultValue) + " ");
                    if (meta.type === "set") {
                        md.push("* **options**: " + JSON.stringify(meta.set) + " ");
                    }
                    md.push("");
                });
                element.html(marked(md.join("\n")));
            });
        };
        return PublishedProperties;
    }(common_1.HTMLWidget));
    exports.PublishedProperties = PublishedProperties;
});
//# sourceMappingURL=publishedProperties.js.map
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "./SVGWidget", "./IList", "./TextBox", "css!./List"], function (require, exports, SVGWidget_1, IList_1, TextBox_1) {
    "use strict";
    var List = (function (_super) {
        __extends(List, _super);
        function List() {
            _super.call(this);
            SVGWidget_1.default.call(this);
            IList_1.default.call(this);
            this._listWidgets = {};
        }
        return List;
    }(SVGWidget_1.default));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = List;
    List.prototype._class += " common_List";
    List.prototype.implements(IList_1.default.prototype);
    List.prototype.publish("anchor", "start", "set", "Anchor Position", ["", "start", "middle", "end"], { tags: ["Private"] });
    List.prototype.update = function (domNode, element) {
        SVGWidget_1.default.prototype.update.apply(this, arguments);
        var context = this;
        var line = element.selectAll(".line").data(this.data(), function (d) { return d; });
        line.enter().append("g")
            .attr("class", "line")
            .each(function (d) {
            var newTextBox = new TextBox_1.default()
                .target(this)
                .paddingTop(0)
                .paddingBottom(0)
                .paddingLeft(8)
                .paddingRight(8)
                .text(d)
                .render();
            newTextBox.element()
                .on("click", function (d) {
                context.click(d.text());
            })
                .on("dblclick", function (d) {
                context.dblclick(d.text());
            });
            context._listWidgets[d] = newTextBox;
        });
        var listHeight = 0;
        var listWidth = 0;
        var listCount = 0;
        for (var key in this._listWidgets) {
            if (!this._listWidgets.hasOwnProperty(key))
                continue;
            var bbox = this._listWidgets[key].getBBox();
            listHeight += bbox.height;
            if (listWidth < bbox.width)
                listWidth = bbox.width;
            ++listCount;
        }
        var yPos = -listHeight / 2; // + lineHeight / 2;
        line.each(function (d) {
            var widget = context._listWidgets[d];
            var bbox = widget.getBBox();
            widget
                .pos({ x: 0, y: yPos + bbox.height / 2 })
                .anchor(context.anchor())
                .fixedSize({ width: listWidth, height: bbox.height })
                .render();
            yPos += bbox.height;
        });
        line.exit()
            .remove()
            .each(function (d) {
            context._listWidgets[d].target(null);
            delete context._listWidgets[d];
        });
    };
    List.prototype.exit = function (domNode, element) {
        for (var key in this._listWidgets) {
            this._listWidgets[key].target(null);
        }
        SVGWidget_1.default.prototype.exit.apply(this, arguments);
    };
});
//# sourceMappingURL=List.js.map
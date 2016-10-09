var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "d3", "../common/SVGWidget", "../api/I2DChart", "../common/Text", "../common/FAChar", "../common/Utility", "../api/ITooltip", "css!./Bubble"], function (require, exports, d3, SVGWidget_1, I2DChart_1, Text_1, FAChar_1, Utility_1, ITooltip_1) {
    "use strict";
    var Bubble = (function (_super) {
        __extends(Bubble, _super);
        function Bubble() {
            _super.call(this);
            SVGWidget_1.SVGWidget.call(this);
            I2DChart_1.I2DChart.call(this);
            ITooltip_1.ITooltip.call(this);
            Utility_1.SimpleSelectionMixin.call(this);
            this._drawStartPos = "origin";
            this.labelWidgets = {};
            this.d3Pack = d3.layout.pack()
                .sort(function (a, b) { return a < b ? -1 : a > b ? 1 : 0; })
                .size([this.width(), this.height()])
                .value(function (d) { return d[1]; });
        }
        Bubble.prototype.size = function (_) {
            var retVal = _super.prototype.size.apply(this, arguments);
            if (arguments.length) {
                this.d3Pack
                    .size([this.width(), this.height()]);
            }
            return retVal;
        };
        Bubble.prototype.enter = function (domNode, element) {
            _super.prototype.enter.apply(this, arguments);
            this._selection.widgetElement(element);
            var context = this;
            this
                .tooltipHTML(function (d) {
                return context.tooltipFormat({ label: d[0], value: d[1] });
            });
        };
        Bubble.prototype.update = function (domNode, element) {
            var context = this;
            this._palette = this._palette.switch(this.paletteID());
            if (this.useClonedPalette()) {
                this._palette = this._palette.cloneNotExists(this.paletteID() + "_" + this.id());
            }
            var node = element.selectAll(".node")
                .data(this.data().length ? this.d3Pack.nodes({ children: this.cloneData() }).filter(function (d) { return !d.children; }) : [], function (d) { return d[0]; });
            //  Enter  ---
            node.enter().append("g")
                .attr("class", "node")
                .attr("opacity", 0)
                .call(this._selection.enter.bind(this._selection))
                .on("click", function (d) {
                context.click(context.rowToObj(d), context.columns()[1], context._selection.selected(this));
            })
                .on("dblclick", function (d) {
                context.dblclick(context.rowToObj(d), context.columns()[1], context._selection.selected(this));
            })
                .each(function (d) {
                var element = d3.select(this);
                element.append("circle")
                    .attr("r", function (d) { return d.r; })
                    .on("mouseout.tooltip", context.tooltip.hide)
                    .on("mousemove.tooltip", context.tooltip.show);
                if (d.__viz_faChar) {
                    context.labelWidgets[d[0]] = new FAChar_1.FAChar()
                        .char(d.__viz_faChar)
                        .target(this)
                        .render();
                }
                else {
                    context.labelWidgets[d[0]] = new Text_1.Text()
                        .text(d[0])
                        .target(this)
                        .render();
                }
            });
            //  Update  ---
            node.transition()
                .attr("opacity", 1)
                .each(function (d) {
                var element = d3.select(this);
                var pos = { x: d.x, y: d.y };
                element.select("circle").transition()
                    .attr("transform", function (d) { return "translate(" + pos.x + "," + pos.y + ")"; })
                    .style("fill", function (d) { return context._palette(d[0]); })
                    .attr("r", function (d) { return d.r; })
                    .select("title")
                    .text(function (d) { return d[0] + " (" + d[1] + ")"; });
                if (d.__viz_faChar) {
                    context.labelWidgets[d[0]]
                        .pos(pos)
                        .render();
                }
                else {
                    var label = d[0];
                    var labelWidth = context.labelWidgets[d[0]].getBBox().width;
                    if (d.r * 2 < 16) {
                        label = "";
                    }
                    else if (d.r * 2 < labelWidth) {
                        label = label[0] + "...";
                    }
                    context.labelWidgets[d[0]]
                        .pos(pos)
                        .text(label)
                        .render();
                }
            });
            //  Exit  ---
            node.exit().transition()
                .style("opacity", 0)
                .remove();
        };
        ;
        Bubble.prototype.exit = function (domNode, element) {
            _super.prototype.exit.apply(this, arguments);
        };
        return Bubble;
    }(SVGWidget_1.SVGWidget));
    exports.Bubble = Bubble;
    Bubble.prototype._class += " chart_Bubble";
    Bubble.prototype.implements(I2DChart_1.I2DChart.prototype);
    Bubble.prototype.implements(ITooltip_1.ITooltip.prototype);
    Bubble.prototype.mixin(Utility_1.SimpleSelectionMixin);
    Bubble.prototype.publish("paletteID", "default", "set", "Palette ID", Bubble.prototype._palette.switch(), { tags: ["Basic", "Shared"] });
    Bubble.prototype.publish("useClonedPalette", false, "boolean", "Enable or disable using a cloned palette", null, { tags: ["Intermediate", "Shared"] });
});
//# sourceMappingURL=Bubble.js.map
import "./Bubble.css";
import { pack as d3Pack } from "d3-hierarchy";
import { select as d3Select } from "d3-selection";
import { I2DChart } from "../api/I2DChart";
import { ITooltip } from "../api/ITooltip";
import { FAChar } from "../common/FAChar";
import { SVGWidget } from "../common/SVGWidget";
import { Text } from "../common/Text";
import * as Utility from "../common/Utility";

export function Bubble() {
    SVGWidget.call(this);
    I2DChart.call(this);
    ITooltip.call(this);
    Utility.SimpleSelectionMixin.call(this);

    this._drawStartPos = "origin";

    this.labelWidgets = {};

    this.d3Pack = d3Pack()
        .sort(function (a, b) { return a < b ? -1 : a > b ? 1 : 0; })
        .size([this.width(), this.height()])
        .value(function (d) { return d[1]; })
        ;
}
Bubble.prototype = Object.create(SVGWidget.prototype);
Bubble.prototype.constructor = Bubble;
Bubble.prototype._class += " chart_Bubble";
Bubble.prototype.implements(I2DChart.prototype);
Bubble.prototype.implements(ITooltip.prototype);
Bubble.prototype.mixin(Utility.SimpleSelectionMixin);

Bubble.prototype.publish("paletteID", "default", "set", "Palette ID", Bubble.prototype._palette.switch(), { tags: ["Basic", "Shared"] });
Bubble.prototype.publish("useClonedPalette", false, "boolean", "Enable or disable using a cloned palette", null, { tags: ["Intermediate", "Shared"] });

Bubble.prototype.size = function (_) {
    const retVal = SVGWidget.prototype.size.apply(this, arguments);
    if (arguments.length) {
        this.d3Pack
            .size([this.width(), this.height()])
            ;
    }
    return retVal;
};

Bubble.prototype.enter = function (_domNode, element) {
    SVGWidget.prototype.enter.apply(this, arguments);
    this._selection.widgetElement(element);
    const context = this;
    this
        .tooltipHTML(function (d) {
            return context.tooltipFormat({ label: d[0], value: d[1] });
        })
        ;
};

Bubble.prototype.update = function (_domNode, element) {
    const context = this;

    this._palette = this._palette.switch(this.paletteID());
    if (this.useClonedPalette()) {
        this._palette = this._palette.cloneNotExists(this.paletteID() + "_" + this.id());
    }

    const node = element.selectAll(".node")
        .data(this.data().length ? this.d3Pack.nodes({ children: this.cloneData() }).filter(function (d) { return !d.children; }) : [], function (d) { return d[0]; })
        ;

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
            const element2 = d3Select(this);
            element2.append("circle")
                .attr("r", function (d2) { return d2.r; })
                .on("mouseout.tooltip", context.tooltip.hide)
                .on("mousemove.tooltip", context.tooltip.show)
                ;
            if (d.__viz_faChar) {
                context.labelWidgets[d[0]] = new FAChar()
                    .char(d.__viz_faChar)
                    .target(this)
                    .render()
                    ;
            } else {
                context.labelWidgets[d[0]] = new Text()
                    .text(d[0])
                    .target(this)
                    .render()
                    ;
            }
        })
        .merge(node).transition()
        .attr("opacity", 1)
        .each(function (d) {
            const element2 = d3Select(this);
            const pos = { x: d.x, y: d.y };
            element2.select("circle").transition()
                .attr("transform", function () { return "translate(" + pos.x + "," + pos.y + ")"; })
                .style("fill", function (d2) { return context._palette(d2[0]); })
                .attr("r", function (d2) { return d2.r; })
                .select("title")
                .text(function (d2) { return d2[0] + " (" + d2[1] + ")"; })
                ;
            if (d.__viz_faChar) {
                context.labelWidgets[d[0]]
                    .pos(pos)
                    .render()
                    ;
            } else {
                let label = d[0];
                const labelWidth = context.labelWidgets[d[0]].getBBox().width;
                if (d.r * 2 < 16) {
                    label = "";
                } else if (d.r * 2 < labelWidth) {
                    label = label[0] + "...";
                }
                context.labelWidgets[d[0]]
                    .pos(pos)
                    .text(label)
                    .render()
                    ;
            }
        })
        ;

    //  Exit  ---
    node.exit().transition()
        .style("opacity", 0)
        .remove()
        ;
};

Bubble.prototype.exit = function (_domNode, _element) {
    SVGWidget.prototype.exit.apply(this, arguments);
};

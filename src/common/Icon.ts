import { SVGWidget } from "./SVGWidget";
import { Shape } from "./Shape";
import { FAChar } from "./FAChar";
import "css!./Icon";

export class Icon extends SVGWidget {
    static _class = "common_Icon";

    protected _shapeWidget = new Shape();
    protected _faChar = new FAChar();
    protected _defs;
    protected _root;
    protected _tooltipElement;

    constructor() {
        super();

    }

    intersection(pointA, pointB) {
        return this._shapeWidget.intersection(pointA, pointB);
    };

    enter(domNode, element) {
        super.enter(domNode, element);
        this._defs = element.append("defs");
        this._defs.append("clipPath")
            .attr("id", "clip_" + this.id() + "_circle")
            .append("circle")
            .attr("x", 0)
            .attr("y", 0)
            ;
        this._defs.append("clipPath")
            .attr("id", "clip_" + this.id() + "_square")
            .append("rect")
            ;
        this._root = element.append("g");
        this._shapeWidget
            .target(this._root.node())
            .render()
            ;
        this._faChar
            .target(element.node())
            .render()
            ;
        this._tooltipElement = element.append("title");
        var context = this;
        element
            .on("click", function (el) {
                context.click(el);
            })
            .on("dblclick", function (el) {
                context.dblclick(el);
            })
            ;
    };

    click(domNode) {
        console.log("Clicked the icon");
    };

    dblclick(domNode) {
        console.log("Double clicked the icon");
    };

    update(domNode, element) {
        super.update(domNode, element);

        var diameter = this.diameter();
        var radius = diameter / 2;
        this._defs.select("circle")
            .attr("r", radius)
            ;
        this._defs.select("rect")
            .attr("x", -radius)
            .attr("y", -radius)
            .attr("width", diameter)
            .attr("height", diameter)
            ;
        this._faChar
            .fontSize(diameter * (100 - this.paddingPercent()) / 100)
            .render()
            ;
        this._shapeWidget
            .shape(this.shape())
            .width(diameter)
            .height(diameter)
            .render()
            ;
        var image = this._root.selectAll("image").data(this.imageUrl() ? [this.imageUrl()] : [], function (d) { return d; });
        image.enter()
            .append("image")
            .attr("xlink:href", this.imageUrl())
            ;
        image
            .attr("clip-path", "url(#clip_" + this.id() + "_" + this.shape() + ")")
            .attr("x", -radius)
            .attr("y", -radius)
            .attr("width", diameter)
            .attr("height", diameter)
            ;
        image.exit()
            .remove()
            ;
        this._tooltipElement.text(this.tooltip());
    };

    exit(domNode, element) {
        super.exit(domNode, element);
        this._shapeWidget
            .target(null)
            ;
        this._faChar
            .target(null)
            ;
    };

    shape: { (): string; (_: string): Icon; }
    faChar: { (): string; (_: string): Icon; }
    imageUrl: { (): string; (_: string): Icon; }
    image_colorFill: { (): string; (_: string): Icon; }
    tooltip: { (): string; (_: string): Icon; }
    diameter: { (): number; (_: number): Icon; }
    paddingPercent: { (): number; (_: number): Icon; }
    shape_colorFill: { (): string; (_: string): Icon; }
    shape_colorStroke: { (): string; (_: string): Icon; }
}

Icon.prototype.publish("shape", "circle", "set", "Shape Type", ["circle", "square"], { tags: ["Private"] });
Icon.prototype.publishProxy("faChar", "_faChar", "char");
Icon.prototype.publish("imageUrl", null, "string", "Image URL", null, { optional: true });
Icon.prototype.publishProxy("image_colorFill", "_faChar", "text_colorFill");
Icon.prototype.publish("tooltip", "", "string", "Tooltip", null, { tags: ["Private"] });
Icon.prototype.publish("diameter", 24, "number", "Diameter", null, { tags: ["Private"] });
Icon.prototype.publish("paddingPercent", 45, "number", "Padding Percent", null, { tags: ["Private"] });
Icon.prototype.publishProxy("shape_colorFill", "_shapeWidget", "colorFill");
Icon.prototype.publishProxy("shape_colorStroke", "_shapeWidget", "colorStroke");


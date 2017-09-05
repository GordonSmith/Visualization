import { BBox, d3SelectionType, HTMLWidget, Widget } from "@hpcc-js/common";

import "../src/Border2.css";

class WidgetDiv {
    private _div: d3SelectionType;
    private _widget: Widget;

    constructor(div: d3SelectionType) {
        this._div = div;
    }

    widget(): Widget;
    widget(_: Widget): this;
    widget(_?: Widget): Widget | this {
        if (!arguments.length) return this._widget;
        if (this._widget !== _) {
            if (this._widget) {
                this._widget.target(null);
            }
            this._widget = _;
            if (this._widget) {
                this._widget.target(this._div.node());
            }
        }
        return this;
    }

    resize(size: { width: number, height: number }) {
        if (this._widget) {
            this._widget.resize(size);
        }
        return this;
    }

    render(getBBox?): this | BBox {
        if (this._widget) {
            this._widget.render();
            if (getBBox && this._widget.visible()) {
                const retVal = this._widget.getBBox();
                retVal.width += 8;
                retVal.height += 8;
                return retVal;
            }
        }
        if (getBBox) {
            return { x: 0, y: 0, width: 0, height: 0 };
        }
        return this;
    }
}

export class Border2 extends HTMLWidget {

    private _topWA: WidgetDiv;
    private _leftWA: WidgetDiv;
    private _centerWA: WidgetDiv;
    private _rightWA: WidgetDiv;
    private _bottomWA: WidgetDiv;

    constructor() {
        super();
        this._tag = "div";
    }

    enter(domNode, element) {
        super.enter(domNode, element);

        this._topWA = new WidgetDiv(element.append("header"));
        const body = element.append("div").attr("class", "body");
        this._centerWA = new WidgetDiv(body.append("center"));
        this._leftWA = new WidgetDiv(body.append("lhs"));
        this._rightWA = new WidgetDiv(body.append("rhs"));
        this._bottomWA = new WidgetDiv(element.append("footer"));
    }

    update(domNode, element) {
        super.update(domNode, element);
        const topBBox: BBox = this._topWA.widget(this.top()).render(true) as BBox;
        const leftBBox: BBox = this._leftWA.widget(this.left()).render(true) as BBox;
        const rightBBox: BBox = this._rightWA.widget(this.right()).render(true) as BBox;
        const bottomBBox: BBox = this._bottomWA.widget(this.bottom()).render(true) as BBox;

        this._leftWA
            .resize({ width: leftBBox.width, height: this.height() - (topBBox.height + bottomBBox.height) })
            .render()
            ;
        this._rightWA
            .resize({ width: rightBBox.width, height: this.height() - (topBBox.height + bottomBBox.height) })
            .render()
            ;
        this._centerWA
            .widget(this.center())
            .resize({ width: this.width() - (leftBBox.width + rightBBox.width), height: this.height() - (topBBox.height + bottomBBox.height) })
            .render()
            ;
        this._bottomWA
            .resize({ width: this.width(), height: bottomBBox.height })
            .render()
            ;
    }

    exit(domNode, element) {
        super.exit(domNode, element);
    }
}
Border2.prototype._class += " layout_Border2";

export interface Border2 {
    top(): Widget;
    top(_: Widget): this;
    left(): Widget;
    left(_: Widget): this;
    center(): Widget;
    center(_: Widget): this;
    right(): Widget;
    right(_: Widget): this;
    bottom(): Widget;
    bottom(_: Widget): this;
}
Border2.prototype.publish("top", null, "widget", "Top Widget");
Border2.prototype.publish("left", null, "widget", "Left Widget");
Border2.prototype.publish("center", null, "widget", "Center Widget");
Border2.prototype.publish("right", null, "widget", "Right Widget");
Border2.prototype.publish("bottom", null, "widget", "Bottom Widget");
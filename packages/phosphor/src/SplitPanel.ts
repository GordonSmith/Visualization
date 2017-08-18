import { HTMLWidget, SVGWidget, Widget } from "@hpcc-js/common";
import { SplitPanel as PSplitPanel, Widget as PWidget } from "@hpcc-js/phosphor-shim";

import { WidgetAdapter } from "./WidgetAdapter";

import "../src/DockPanel.css";

export class SplitPanel extends HTMLWidget {
    private _split = new PSplitPanel({ orientation: "vertical" });
    protected content: WidgetAdapter[] = [];

    constructor() {
        super();
        this._tag = "div";
        this._split.id = "p" + this.id();
    }

    protected getWidgetAdapter(widget: Widget): WidgetAdapter | null {
        let retVal = null;
        this.content.some(wa => {
            if (wa.widget === widget) {
                retVal = wa;
                return true;
            }
            return false;
        });
        return retVal;
    }

    addWidget(widget: SVGWidget | HTMLWidget) {
        const wa = new WidgetAdapter(widget);
        this._split.addWidget(wa);
        this.content.push(wa);
        return this;
    }

    enter(domNode, element) {
        super.enter(domNode, element);
        PWidget.attach(this._split, domNode);
    }

    update(domNode, element) {
        super.update(domNode, element);
        element.select(".p-Widget")
            .style("width", this.width() + "px")
            .style("height", this.height() + "px")
            ;
        this._split.update();
    }

    exit(domNode, element) {
        super.exit(domNode, element);
    }
}
SplitPanel.prototype._class += " phosphor_SplitPanel";

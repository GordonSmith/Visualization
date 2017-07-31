import { PropertyExt, Widget } from "@hpcc-js/common";
import { DockPanel, WidgetAdapter } from "@hpcc-js/phosphor";
import { Viz } from "./viz";

export class Dashboard extends DockPanel {

    protected _prevActive;

    private _visualizations: Viz[] = [];
    visualizations() {
        return [...this._visualizations];
    }

    visualization(w: PropertyExt) {
        return this._visualizations.filter(v => v.vizProps() === w)[0];
    }

    addVisualization(viz: Viz): this {
        this._visualizations.push(viz);
        return this;
    }

    update(domNode, element) {
        const previous = this.widgets();
        const current = this.visualizations().map(viz => viz.vizProps());
        const removed = previous.filter(x => current.indexOf(x) === -1);
        const added = current.filter(x => previous.indexOf(x) === -1);
        const updated = this.visualizations().filter(viz => added.indexOf(viz.vizProps()) === -1);
        for (const w of removed) {
            this.removeWidget(w);
        }
        const context = this;
        for (const w of added) {
            this.addWidget(w, this.visualization(w).view().label());
            const wa: any = this.getWidgetAdapter(w);
            const origActivateRequest = wa.onActivateRequest;
            wa.onActivateRequest = function (msg): void {
                origActivateRequest.apply(this, arguments);
                if (context._prevActive !== this._widget) {
                    context._prevActive = this._widget;
                    context.ActiveChanged(context._visualizations.filter(v => v.vizProps() === this._widget)[0], this._widget, wa);
                }
            };
        }
        for (const viz of updated) {
            const wa: any = this.getWidgetAdapter(viz.vizProps());
            wa.title.label = viz.view().label();
        }
        super.update(domNode, element);
    }

    ActiveChanged(v: Viz, w: Widget, wa: WidgetAdapter) {
    }
}
Dashboard.prototype._class += " dashboard_dashboard";

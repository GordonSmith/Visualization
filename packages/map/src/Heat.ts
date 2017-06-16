import { HeatMap } from "@hpcc-js/other";
import { Layer } from "./Layer";

import "../src/Heat.css";

export class Heat extends Layer {
    _heatTransform;
    heat;
    _prevProjection;

    constructor() {
        super();
    }

    layerEnter(base, svgElement, domElement) {
        Layer.prototype.layerEnter.apply(this, arguments);
        this._parentOverlay.style("pointer-events", "none");
        this._heatTransform = domElement
            .style("pointer-events", "none")
            .append("div")
            .attr("class", this.classID())
            .style("width", base.width() + "px")
            .style("height", base.height() + "px")
            ;
        this.heat = new HeatMap()
            .target(this._heatTransform.node())
            ;
    }

    layerUpdate(base) {
        Layer.prototype.layerUpdate.apply(this, arguments);

        this._heatTransform
            .style("opacity", this.opacity())
            .style("width", base.width() + "px")
            .style("height", base.height() + "px")
            ;
        this.heat.resize(base.size());

        this.heat
            .columns(this.columns())
            .data(this.data().map(function (row) {
                const pos = base.project(row[0], row[1]);
                return [pos[0], pos[1], row[4]];
            }))
            .render()
            ;
    }

    layerExit(base) {
        delete this._prevProjection;
        this.heat.target(null);
        delete this.heat;
    }

    layerZoomed(base) {
        Layer.prototype.layerZoomed.apply(this, arguments);
        this.heat
            .columns(this.columns())
            .data(this.visible() ? this.data().map(function (row) {
                const pos = base.project(row[0], row[1]);
                return [pos[0], pos[1], row[4]];
            }) : [])
            .render()
            ;
    }

    opacity: { (): number; (_: number): Heat };
    opacity_exists: () => boolean;
}
Heat.prototype._class += " map_Heat";

Heat.prototype.publish("opacity", 1.0, "number", "Opacity", null, { tags: ["Advanced"] });

// Heat.prototype.publish("meshColor", null, "html-color", "Stroke Color", null, { optional: true });
// Heat.prototype.publish("meshStrokeWidth", 0.25, "number", "Stroke Width");

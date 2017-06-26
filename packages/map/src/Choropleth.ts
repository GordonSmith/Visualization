import { Palette, Utility } from "@hpcc-js/common";
import { select as d3Select } from "d3-selection";
import * as topojson from "topojson";
import { Layer } from "./Layer";

import "../src/Choropleth.css";

declare const require: any;

export class Choropleth extends Layer {
    _dataMap = {};
    _path: any = d3Select(null);
    _palette;
    _dataMinWeight;
    _dataMaxWeight;
    _choroplethData;
    _choroplethTransform;
    _choropleth;
    _choroTopology;
    _choroTopologyObjects;
    _prevProjection;
    _prevInternalOnly;
    _topoJsonFolder: string;

    constructor() {
        super();
        Utility.SimpleSelectionMixin.call(this);
        this._topoJsonFolder = require && require.toUrl ? require.toUrl("@hpcc-js/map/TopoJSON") : "../TopoJSON";
    }

    data(_?) {
        const retVal = Layer.prototype.data.apply(this, arguments);
        if (arguments.length) {
            this._dataMap = {};
            this._dataMinWeight = null;
            this._dataMaxWeight = null;

            const context = this;
            this.data().forEach(function (item) {
                context._dataMap[item[0]] = item;
                if (!context._dataMinWeight || item[1] < context._dataMinWeight) {
                    context._dataMinWeight = item[1];
                }
                if (!context._dataMaxWeight || item[1] > context._dataMaxWeight) {
                    context._dataMaxWeight = item[1];
                }
            });
        }
        return retVal;
    }

    getDataBounds() {
        const bbox = this._choroplethData.node().getBBox();
        const retVal = {
            x: bbox.x,
            y: bbox.y,
            width: bbox.width,
            height: bbox.height
        };
        /*
        const scale = this._zoom.scale();
        retVal.x *= scale;
        retVal.y *= scale;
        retVal.width *= scale;
        retVal.height *= scale;
        const translate = this._zoom.translate();
        retVal.x += translate[0];
        retVal.y += translate[1];
        */
        return retVal;
    }

    autoScale() {
        switch (this.autoScaleMode()) {
            case "none":
                return;
            case "mesh":
                this.zoomToBBox(this.getBounds());
                break;
            case "data":
                this.zoomToBBox(this.getDataBounds());
                break;
        }
    }

    layerEnter(base, svgElement, domElement) {
        Layer.prototype.layerEnter.apply(this, arguments);

        this._choroplethTransform = svgElement;
        this._choroplethData = this._choroplethTransform.append("g");
        this._choropleth = this._choroplethTransform.append("path")
            .attr("class", "mesh")
            .attr("vector-effect", "non-scaling-stroke")
            ;
    }

    layerUpdate(base, forcePath?) {
        Layer.prototype.layerUpdate.apply(this, arguments);

        this._palette = this._palette.switch(this.paletteID());
        if (this.useClonedPalette()) {
            this._palette = this._palette.cloneNotExists(this.paletteID() + "_" + this.id());
        }

        if (!this.visible() || !this.meshVisible()) {
            this._choropleth.attr("d", "");
            delete this._prevProjection;
            return;
        }

        if (forcePath || this._prevProjection !== base.projection() || this._prevInternalOnly !== this.internalOnly()) {
            this._choropleth
                .attr("d", base._d3GeoPath(topojson.mesh(this._choroTopology, this._choroTopologyObjects, this.internalOnly() ? function (a, b) { return a !== b; } : function (a, b) { return true; })))
                ;
            this._prevProjection = base.projection();
            this._prevInternalOnly = this.internalOnly();
        }
        this._choroplethTransform
            .style("opacity", this.opacity())
            .style("stroke", this.meshColor())
            ;
    }

    layerExit(base) {
        delete this._prevProjection;
        delete this._prevInternalOnly;
    }

    //  Events  ---
    click(row, column, selected) {
        console.log("Click:  " + JSON.stringify(row) + ", " + column + ", " + selected);
    }

    dblclick(row, column, selected) {
        console.log("Double click:  " + JSON.stringify(row) + ", " + column + ", " + selected);
    }

    paletteID: { (): string; (_: string): Choropleth };
    paletteID_exists: () => boolean;
    useClonedPalette: { (): boolean; (_: boolean): Choropleth };
    useClonedPalette_exists: () => boolean;
    opacity: { (): number; (_: number): Choropleth };
    opacity_exists: () => boolean;
    meshVisible: { (): boolean; (_: boolean): Choropleth };
    meshVisible_exists: () => boolean;
    meshColor: { (): string; (_: string): Choropleth };
    meshColor_exists: () => boolean;
    meshStrokeWidth: { (): number; (_: number): Choropleth };
    meshStrokeWidth_exists: () => boolean;
    internalOnly: { (): boolean; (_: boolean): Choropleth };
    internalOnly_exists: () => boolean;
    autoScaleMode: { (): string; (_: string): Choropleth };
    autoScaleMode_exists: () => boolean;
}
Choropleth.prototype._class += " map_Choropleth";
Choropleth.prototype.mixin(Utility.SimpleSelectionMixin);

Choropleth.prototype._palette = Palette.rainbow("default");

Choropleth.prototype.publish("paletteID", "YlOrRd", "set", "Palette ID", Choropleth.prototype._palette.switch(), { tags: ["Basic", "Shared"] });
Choropleth.prototype.publish("useClonedPalette", false, "boolean", "Enable or disable using a cloned palette", null, { tags: ["Intermediate", "Shared"] });

Choropleth.prototype.publish("opacity", 1.0, "number", "Opacity", null, { tags: ["Advanced"] });

Choropleth.prototype.publish("meshVisible", true, "boolean", "Mesh Visibility");
Choropleth.prototype.publish("meshColor", null, "html-color", "Stroke Color", null, { optional: true });
Choropleth.prototype.publish("meshStrokeWidth", 0.25, "number", "Stroke Width");
Choropleth.prototype.publish("internalOnly", false, "boolean", "Internal mesh only");
Choropleth.prototype.publish("autoScaleMode", "mesh", "set", "Auto Scale", ["none", "mesh", "data"], { tags: ["Basic"], override: true });

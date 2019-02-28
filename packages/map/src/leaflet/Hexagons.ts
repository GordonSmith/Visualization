import { Palette } from "@hpcc-js/common";
import { geoToH3, h3ToGeoBoundary, polyfill } from "@hpcc-js/h3-js-umd";
import { extent as d3Extent } from "d3-array";
import { LeafletEvent, Map, Polygon } from "leaflet";
import { ClusterLayer } from "./FeatureLayer";

type Spread = [number, number];
type Point = [number, number];
const calcSpread = (prev: Spread, p: Point): Spread => {
    if (p[1] < -90) prev[0]++;
    else if (p[1] > 90) prev[1]++;
    return prev;
};
const shiftLeft = (lng: number): number => lng > 90 ? lng - 360 : lng;
const shiftRight = (lng: number): number => lng < -90 ? lng + 360 : lng;
const shiftPoint = (left: boolean): (p: Point) => Point => {
    const shiftFunc = left ? shiftLeft : shiftRight;
    return (p: Point) => [p[0], shiftFunc(p[1])];
};

export class Hexagons extends ClusterLayer {

    _palette;

    protected fixDateLine(points: Point[]): Point[] {
        const [lhsCount, rhsCount] = points.reduce(calcSpread, [0, 0]);
        if (lhsCount && rhsCount) {
            return points.map(shiftPoint(lhsCount >= rhsCount));
        }
        return points;
    }

    hasBounds(): boolean {
        return true;
    }

    updateHexagons() {
        this._palette = this._palette.switch(this.paletteID());
        if (this.useClonedPalette()) {
            this._palette = this._palette.cloneNotExists(this.paletteID() + "_" + this.id());
        }

        const columns = this.columns();
        const latIdx = columns.indexOf(this.latitudeColumn());
        const lngIdx = columns.indexOf(this.longtitudeColumn());
        const h3IndexCol = 0;

        let resolution = this.h3Resolution();
        if (resolution > 15) {
            resolution = 15;
        }

        const data = this.data().filter(row => !this.omitNullLatLong() || (!!row[latIdx] && !!row[lngIdx])).map(row => [geoToH3(row[latIdx], row[lngIdx], resolution)]);

        const extent = d3Extent(data, row => 1);

        this.clear();
        data.forEach(row => {
            const points = h3ToGeoBoundary(row[h3IndexCol]);
            this.add(new Polygon(this.fixDateLine(points), {
                color: this._palette(extent[1]),
                fillColor: this._palette(1, extent[0], extent[1]),
                fillOpacity: this.opacity(),
                origRow: row
            } as any).on("click", e => this.clickHandler(e, row)));
        });
    }

    layerUpdate(map: Map) {
        super.layerUpdate(map);
        this.updateHexagons();
    }

    //  Events  ---
    zoomEnd(e: LeafletEvent) {
        super.zoomEnd(e);
        this.updateHexagons();
    }

    moveEnd(e: LeafletEvent) {
        super.moveEnd(e);
        this.updateHexagons();
    }

    clickHandler(e, row) {
    }
}
Hexagons.prototype._class += " map_Hexagons";
Hexagons.prototype._palette = Palette.rainbow("default");

export interface Hexagons {
    paletteID(): string;
    paletteID(_: string): this;
    paletteID_exists(): boolean;
    useClonedPalette(): boolean;
    useClonedPalette(_: boolean): this;
    useClonedPalette_exists(): boolean;

    latitudeColumn(): string;
    latitudeColumn(_: string);
    longtitudeColumn(): string;
    longtitudeColumn(_: string);
    omitNullLatLong(): boolean;
    omitNullLatLong(_: boolean);

    opacity(): number;
    opacity(_: number): this;
    opacity_default(_: number): this;
    opacity_exists(): boolean;
}

Hexagons.prototype.publish("paletteID", "YlOrRd", "set", "Color palette for this widget", Hexagons.prototype._palette.switch(), { tags: ["Basic", "Shared"] });
Hexagons.prototype.publish("useClonedPalette", false, "boolean", "Enable or disable using a cloned palette", null, { tags: ["Intermediate", "Shared"] });
Hexagons.prototype.publish("latitudeColumn", null, "set", "Latitude column", function () { return this.columns(); }, { optional: true });
Hexagons.prototype.publish("longtitudeColumn", null, "set", "Longtitude column", function () { return this.columns(); }, { optional: true });
Hexagons.prototype.publish("omitNullLatLong", true, "boolean", "Remove lat=0,lng=0 from pinsData", null, { tags: ["Basic"] });
Hexagons.prototype.publish("opacity", 0.5, "number", "Opacity", null, { tags: ["Advanced"] });

import { Query } from "@hpcc-js/comms";

export class HexTest extends Hexagons {
    // http://192.168.3.22:8002/WsEcl/submit/query/roxie/crowdingservice/json?h3index=612706519269507071
    query = Query.attach({ baseUrl: "http://192.168.3.22:8002" }, "roxie", "crowdingservice");
    updateHexagons() {
        this._palette = this._palette.switch(this.paletteID());
        if (this.useClonedPalette()) {
            this._palette = this._palette.cloneNotExists(this.paletteID() + "_" + this.id());
        }

        let resolution = this.h3Resolution();
        if (resolution > 15) {
            resolution = 15;
        }
        const bounds = this.visibleBounds();
        const east = bounds.getEast();
        const west = bounds.getWest();

        const poly: Array<[number, number]> = [
            [bounds.getNorth(), west < -180 ? -180 : west],
            [bounds.getNorth(), east > 180 ? 180 : east],
            [bounds.getSouth(), east > 180 ? 180 : east],
            [bounds.getSouth(), west < -180 ? -180 : west]
        ];

        const indexQuery = {
            h3IndexSet: {
                Row: polyfill(poly, resolution).map(row => {
                    return {
                        h3Index: row
                    };
                })
            }
        };

        const polyQuery = {
            h3PolySetRes: resolution,
            h3PolySet: {
                Row: poly.map(p => {
                    return { lat: p[0], lng: p[1] };
                })
            }
        };

        this.query.submit(true ? polyQuery : indexQuery).then((response: any) => {
            return response.IndexCountSet;
        }).then((data: any[]) => {
            const extent = d3Extent(data, row => row.rowcount);
            this.clear();
            data.forEach(row => {
                const points = h3ToGeoBoundary(row.h3index);
                const polygon = new Polygon(this.fixDateLine(points), {
                    color: this._palette(extent[1], extent[0], extent[1]),
                    fillColor: row.rowcount === 0 ? "transparent" : this._palette(row.rowcount, extent[0], extent[1]),
                    opacity: this.opacity(),
                    fillOpacity: this.opacity(),
                    origRow: row
                } as any).on("click", e => this.clickHandler(e, row));
                polygon.bindTooltip("Row Count:  " + row.rowcount);
                this.add(polygon);
            });
        });
    }
}

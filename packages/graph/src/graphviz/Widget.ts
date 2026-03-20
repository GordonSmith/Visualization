import { d3Event, select as d3Select, SVGZoomWidget } from "@hpcc-js/common";
import { ID, scopedLogger } from "@hpcc-js/util";
import { format } from "./util.ts";
import type { Vertex } from "./types.ts";

import "./Widget.css";

const logger = scopedLogger("src/graphviz/Widget.ts");

const TypeShape = {
    "function": 'plain" fillcolor="" style="'
};

const CHARS = new Set("0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ");
function encodeID(id: string): string {
    let retVal = "";
    for (let i = 0; i < id.length; ++i) {
        if (CHARS.has(id.charAt(i))) {
            retVal += id.charAt(i);
        } else {
            retVal += `__${id.charCodeAt(i)}__`;
        }
    }
    return retVal;
}

function decodeID(id: string): string {
    return id.replace(/__(\d+)__/gm, (_match, p1) => String.fromCharCode(+p1));
}

export class Rect {

    left: number;
    top: number;
    right: number;
    bottom: number;

    toStruct() {
        return { x: this.left, y: this.top, width: this.right - this.left, height: this.bottom - this.top };
    }

    extend(rect: SVGRect) {
        if (this.left === undefined || this.left > rect.x) {
            this.left = rect.x;
        }
        if (this.top === undefined || this.top > rect.y + rect.height) {
            this.top = rect.y + rect.height;
        }
        if (this.right === undefined || this.right < rect.x + rect.width) {
            this.right = rect.x + rect.width;
        }
        if (this.bottom === undefined || this.bottom < rect.y) {
            this.bottom = rect.y;
        }
    }
}

export class Widget extends SVGZoomWidget {

    protected _selection: { [id: string]: boolean } = {};

    constructor() {
        super();
        this._drawStartPos = "origin";
        this.showToolbar(false);

        this._iconBar
            .buttons([])
            ;
    }

    protected _customVertices: Vertex[] = [];
    prerenderCustomVertices(vertices: Vertex[]): void {
        const container = document.createElement("div");
        container.style.position = "absolute";
        container.style.left = "-9999px";
        container.style.top = "-9999px";
        container.style.visibility = "hidden";
        document.body.appendChild(container);

        const svgEl = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        container.appendChild(svgEl);

        this._customVertices = vertices.filter(v => !!v.svgTpl);
        for (const v of this._customVertices) {
            if (!v.svgTpl) continue;
            const rendered = format(v.svgTpl, v as Record<string, any>);
            const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
            g.innerHTML = rendered;
            svgEl.appendChild(g);
            const bbox = g.getBBox();
            const padding = 4;
            v._svgTplWidth = bbox.width + padding;
            v._svgTplHeight = bbox.height + padding;
            v._svgTplConcrete = rendered;
            svgEl.removeChild(g);
        }

        document.body.removeChild(container);
    }

    exists(id: string) {
        return id && !this._renderElement.select(`#${encodeID(id)}`).empty();
    }

    clearSelection(broadcast: boolean = false) {
        Object.keys(this._selection).filter(name => !!name).forEach(name => {
            d3Select(`#${encodeID(name)}`).classed("selected", false);
        });
        this._selection = {};
        this._selectionChanged(broadcast);
    }

    toggleSelection(id: string, broadcast: boolean = false) {
        if (this._selection[id]) {
            delete this._selection[id];
        } else {
            this._selection[id] = true;
        }
        this._selectionChanged(broadcast);
    }

    selectionCompare(_: string[]): boolean {
        const currSelection = this.selection();
        return currSelection.length !== _.length || _.some(id => currSelection.indexOf(id) < 0);
    }

    selection(): string[];
    selection(_: string[]): this;
    selection(_: string[], broadcast: boolean): this;
    selection(_?: string[], broadcast: boolean = false): string[] | this {
        if (!arguments.length) return Object.keys(this._selection);
        if (this.selectionCompare(_)) {
            this.clearSelection();
            _.forEach(id => this._selection[id] = true);
            this._selectionChanged(broadcast);
        }
        return this;
    }

    itemBBox(scopeID: string) {
        const rect = new Rect();
        const elem = this._renderElement.select(`#${encodeID(scopeID)}`);
        const node = elem.node() as SVGGraphicsElement;
        if (node) {
            rect.extend(node.getBBox());
        }

        const bbox = rect.toStruct();
        const renderBBox = this._renderElement.node().getBBox();
        bbox.y += renderBBox.height;
        return bbox;
    }

    selectionBBox() {
        const rect = new Rect();
        this.selection().filter(sel => !!sel).forEach(sel => {
            const elem = this._renderElement.select(`#${encodeID(sel)}`);
            if (elem?.node()) {
                rect.extend((elem.node() as SVGGraphicsElement).getBBox());
            }
        });
        const bbox = rect.toStruct();
        const renderBBox = this._renderElement.node().getBBox();
        bbox.y += renderBBox.height;
        return bbox;
    }

    _selectionChanged(broadcast = false) {
        const context = this;
        this._renderElement.selectAll(".node,.edge,.cluster")
            .each(function (this: SVGElement) {
                const selected = !!context._selection[decodeID(this.id)];
                const isEdge = this.classList.contains("edge");
                const shapeEls = d3Select(this).selectAll("path,polygon,ellipse,polyline");
                shapeEls
                    .style("stroke", selected ? "var(--gv-select-stroke)" : undefined)
                    ;
                shapeEls
                    .filter(function (_, i) {
                        if (isEdge) return (this as SVGElement).tagName !== "path";
                        return i === 0;
                    })
                    .style("fill", selected ? (isEdge ? "var(--gv-select-stroke)" : "var(--gv-select-fill)") : undefined)
                    ;
                d3Select(this).selectAll("text")
                    .style("fill", selected ? "var(--gv-select-stroke)" : undefined)
                    ;
            })
            ;
        if (broadcast) {
            this.selectionChanged();
        }
    }

    protected _prevSVG;
    protected _svg = "";
    reset() {
        this._prevSVG = "";
        return this;
    }

    svg(): string;
    svg(_: string): this;
    svg(_?: string): this | string {
        if (arguments.length === 0) return this._svg;
        this._svg = _;
        return this;
    }

    centerOnItem(scopeID: string) {
        this.centerOnBBox(this.itemBBox(scopeID));
        return this;
    }

    centerOnSelection(transitionDuration?: number) {
        this.centerOnBBox(this.selectionBBox(), transitionDuration);
        return this;
    }

    zoomToItem(scopeID: string) {
        this.zoomToBBox(this.itemBBox(scopeID));
        return this;
    }

    zoomToSelection(transitionDuration?: number) {
        this.zoomToBBox(this.selectionBBox(), transitionDuration);
        return this;
    }

    enter(domNode, element) {
        super.enter(domNode, element);
    }

    update(domNode, element) {
        super.update(domNode, element);
    }

    exit(domNode, element) {
        super.exit(domNode, element);
    }

    protected _injectSvgContent() {
        for (const v of this._customVertices) {
            const nodeGroup = this._renderElement.select(`#${encodeID(String(v.id))}`);
            if (nodeGroup.empty()) continue;

            const bbox = (nodeGroup.node() as SVGGraphicsElement).getBBox();
            const cx = bbox.x + bbox.width / 2;
            const cy = bbox.y + bbox.height / 2;

            const g = nodeGroup.append("g")
                .attr("class", "svgTpl")
                ;
            g.html(v._svgTplConcrete);

            const contentBBox = (g.node() as SVGGraphicsElement).getBBox();
            const dx = cx - (contentBBox.x + contentBBox.width / 2);
            const dy = cy - (contentBBox.y + contentBBox.height / 2);
            g.attr("transform", `translate(${dx},${dy})`);
        }
    }

    async renderSVG(svg: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this._selection = {};
            const startPos = svg.indexOf("<g id=");
            const endPos = svg.indexOf("</svg>");
            this._renderElement.html(svg.substring(startPos, endPos)
                .replace(/"black"/g, "var(--gv-fg)")
                .replace(/"white"/g, "var(--gv-bg)")
                .replace(/"whitesmoke"/g, "var(--gv-bg)")
                .replace(/"lightgrey"/g, "var(--gv-bg)")
                .replace(/"lightgray"/g, "var(--gv-bg)")
            );
            setTimeout(() => {
                this._injectSvgContent();
                this
                    .zoomToFit(0)
                    ;
                const context = this;
                this._renderElement.selectAll(".node,.edge,.cluster")
                    .on("click", function (this: SVGGElement) {
                        const event = d3Event();
                        if (!event.ctrlKey) {
                            context.clearSelection();
                        }
                        context.toggleSelection(decodeID(this.id), true);
                    })
                    ;
                resolve();
            }, 0);
        });
    }

    render(callback?: (w: Widget) => void) {

        return super.render(async w => {
            if (this._prevSVG !== this._svg) {
                this._prevSVG = this._svg;
                await this.renderSVG(this._svg);
            }
            if (callback) {
                callback(this);
            }
        });
    }

    //  Events  ---
    selectionChanged() {
    }
}
Widget.prototype._class += " graph_GraphvizWidget";

import { Button, d3Event, SVGZoomWidget } from "@hpcc-js/common";
import { Store } from "./Store.ts";
import type { Node, Edge, Cluster, Graph, CustomVertex } from "./types.ts";
import { DotWriter } from "./DotWriter.ts";
import { layoutCache, isGraphvizWorkerResponse } from "./layout.ts";

import "./Widget.css";

function elementBBox(element: SVGGraphicsElement, renderElement: SVGGraphicsElement) {
    const bbox = element.getBBox();
    const elementCTM = element.getCTM();
    const renderCTM = renderElement.getCTM();
    if (!elementCTM || !renderCTM) return bbox;
    const matrix = renderCTM.inverse().multiply(elementCTM);
    const svg = renderElement.ownerSVGElement ?? renderElement.closest("svg") as unknown as SVGSVGElement;
    if (!svg) return bbox;
    const corners = [
        [bbox.x, bbox.y],
        [bbox.x + bbox.width, bbox.y],
        [bbox.x, bbox.y + bbox.height],
        [bbox.x + bbox.width, bbox.y + bbox.height],
    ];
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const [cx, cy] of corners) {
        const pt = svg.createSVGPoint();
        pt.x = cx;
        pt.y = cy;
        const t = pt.matrixTransform(matrix);
        if (t.x < minX) minX = t.x;
        if (t.y < minY) minY = t.y;
        if (t.x > maxX) maxX = t.x;
        if (t.y > maxY) maxY = t.y;
    }
    return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

export interface Data {
    graph?: Graph;
    subgraphs?: Cluster[];
    vertices: Node[];
    edges: Edge[];
}

export class Widget extends SVGZoomWidget {

    protected _data: Store = new Store();
    protected _selection: { [id: string]: boolean } = {};
    private _zoomToSelectionButton = new Button().faChar("fa-arrows-alt").tooltip("Zoom to Fit").on("click", () => this.zoomToSelection());
    private _zoomToSelectionWidthButton = new Button().faChar("fa-arrows-h").tooltip("Zoom to Fit Width").on("click", () => this.zoomToSelectionWidth());
    private _recenterSelectionButton = new Button().faChar("fa-crosshairs").tooltip("Recenter").on("click", () => this.centerOnSelection());

    constructor() {
        super();
        this._drawStartPos = "origin";
        this.showToolbar(true);

        this._iconBar
            .buttons([
                this._zoomToSelectionButton,
                this._zoomToSelectionWidthButton,
                this._recenterSelectionButton,
            ])
            ;
    }

    data(): Data;
    data(_: Data): this;
    data(_?: Data): this | Data {
        if (!arguments.length) return {
            graph: this._data.graph(),
            subgraphs: this._data.subgraphs(),
            vertices: this._data.vertices(),
            edges: this._data.edges(),
        };
        this._data.load(_.vertices, _.edges, _.subgraphs, _.graph);
        return this;
    }

    exists(id: string) {
        return id && !this._renderElement.select(`#${id}`).empty();
    }

    clearSelection(broadcast: boolean = false) {
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

    setClass(className: string, ids?: string[]): this {
        if (ids) {
            for (const id of ids) {
                const elem = this._renderElement.select(`#${id}`);
                if (!elem.empty()) {
                    elem.classed(className, true);
                }
            }
        } else {
            this._renderElement
                .selectAll(".node,.edge,.cluster")
                .classed(className, true)
                ;
        }
        return this;
    }

    clearClass(className: string, ids?: string[]): this {
        if (ids) {
            for (const id of ids) {
                const elem = this._renderElement.select(`#${id}`);
                if (!elem.empty()) {
                    elem.classed(className, false);
                }
            }
        } else {
            this._renderElement
                .selectAll(".node,.edge,.cluster")
                .classed(className, false)
                ;
        }
        return this;
    }

    hasClass(className: string, id: string): boolean {
        const elem = this._renderElement.select(`#${id}`);
        return !elem.empty() && elem.classed(className);
    }

    itemBBox(scopeID: string) {
        const elem = this._renderElement.select(`#${scopeID}`);
        const node = elem.node() as SVGGraphicsElement;
        if (node) {
            return elementBBox(node, this._renderElement.node() as SVGGraphicsElement);
        }
        return { x: 0, y: 0, width: 0, height: 0 };
    }

    selectionBBox() {
        const selection = this.selection().filter(sel => !!sel);
        if (!selection.length) {
            return this.getRenderElementBBox();
        }
        const renderNode = this._renderElement.node() as SVGGraphicsElement;
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        selection.forEach(sel => {
            const elem = this._renderElement.select(`#${sel}`);
            const node = elem.node() as SVGGraphicsElement;
            if (node) {
                const b = elementBBox(node, renderNode);
                if (b.x < minX) minX = b.x;
                if (b.y < minY) minY = b.y;
                if (b.x + b.width > maxX) maxX = b.x + b.width;
                if (b.y + b.height > maxY) maxY = b.y + b.height;
            }
        });
        if (!isFinite(minX)) return this.getRenderElementBBox();
        return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
    }

    _selectionChanged(broadcast = false) {
        const context = this;
        this._renderElement.selectAll(".node,.edge,.cluster")
            .classed("selected", function (this: SVGElement) {
                return !!context._selection[this.id];
            })
            ;

        if (broadcast) {
            this.selectionChanged();
        }
    }

    protected _prevDOT;
    protected _svg = "";
    reset() {
        this._prevDOT = "";
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

    zoomToSelectionWidth(transitionDuration?: number) {
        const bbox = this.selectionBBox();
        this.zoomToBBox({ x: bbox.x, y: bbox.y + bbox.height / 2, width: bbox.width, height: 1 }, transitionDuration);
        return this;
    }

    enter(domNode, element) {
        super.enter(domNode, element);
        const context = this;
        this._renderElement
            .on("click", function () {
                const event = d3Event();
                let target = event.target as SVGElement;
                while (target && target !== event.currentTarget) {
                    const action = (target as Element).getAttribute?.("data-action");
                    if (action) {
                        let nodeEl = target.parentElement as unknown as SVGElement;
                        while (nodeEl && nodeEl !== event.currentTarget) {
                            if (nodeEl.classList?.contains("node")) {
                                context.vertexButtonClicked(nodeEl.id, action);
                                return;
                            }
                            nodeEl = nodeEl.parentElement as unknown as SVGElement;
                        }
                        return;
                    }
                    if (target.classList.contains("node") || target.classList.contains("edge") || target.classList.contains("cluster")) {
                        if (!event.ctrlKey) {
                            context.clearSelection();
                        }
                        context.toggleSelection(target.id, true);
                        return;
                    }
                    target = target.parentElement as unknown as SVGElement;
                }
                // Clicked on empty background — clear selection
                context.clearSelection(true);
            })
            .on("dblclick", function () {
                const event = d3Event();
                event.stopPropagation();
                event.preventDefault();
                let target = event.target as SVGElement;
                while (target && target !== event.currentTarget) {
                    if (target.classList.contains("node") || target.classList.contains("edge") || target.classList.contains("cluster")) {
                        context.zoomToItem(target.id);
                        return;
                    }
                    target = target.parentElement as unknown as SVGElement;
                }
                // Double-clicked on empty background — zoom to fit the entire graph
                context.zoomToFit();
            })
            ;
        this._zoomGrab
            .on("dblclick", function () {
                const event = d3Event();
                event.stopPropagation();
                event.preventDefault();
                context.zoomToFit();
            })
            ;
    }

    update(domNode, element) {
        super.update(domNode, element);
    }

    exit(domNode, element) {
        super.exit(domNode, element);
    }

    private static readonly _svgColorMap: Record<string, string> = {
        '"black"': "var(--gv-fg)",
        '"white"': "var(--gv-bg)"
    };
    private static readonly _svgColorRe = /"black"|"white"/g;

    renderSVG(svg: string) {
        this._selection = {};
        const startPos = svg.indexOf("<g id=");
        const endPos = svg.lastIndexOf("</svg>");
        this._renderElement.html(svg.substring(startPos, endPos)
            .replace(Widget._svgColorRe, m => Widget._svgColorMap[m])
        );
    }

    protected postrenderCustomVertices(customVertices: CustomVertex[]) {
        for (const v of customVertices) {
            const nodeGroup = this._renderElement.select(`#${v.id}`);
            if (nodeGroup.empty()) continue;

            const bbox = (nodeGroup.node() as SVGGraphicsElement).getBBox();
            const cx = bbox.x + bbox.width / 2;
            const cy = bbox.y + bbox.height / 2;

            // Make the Graphviz-rendered shape invisible so the custom content shows cleanly
            nodeGroup.select("polygon,ellipse,path")
                .attr("stroke", "transparent")
                .attr("fill", "transparent")
                ;

            if (v.html) {
                const nodeId = v.id;
                const fo = nodeGroup.append("foreignObject")
                    .attr("class", "htmlContent")
                    .attr("width", bbox.width)
                    .attr("height", bbox.height)
                    .attr("x", bbox.x)
                    .attr("y", bbox.y)
                    ;
                const div = fo.append("xhtml:div")
                    .attr("xmlns", "http://www.w3.org/1999/xhtml")
                    .style("width", `${bbox.width}px`)
                    .style("height", `${bbox.height}px`)
                    .style("overflow", "hidden")
                    .html(v.html)
                    ;
                // Attach direct listeners to action buttons — foreignObject clicks
                // do not reliably bubble to the SVG event handler across all browsers.
                (div.node() as HTMLElement).querySelectorAll<HTMLElement>("[data-action]").forEach(btn => {
                    btn.addEventListener("click", (e) => {
                        e.stopPropagation();
                        this.vertexButtonClicked(nodeId, btn.dataset.action!);
                    });
                });
            } else if (v.svg) {
                const g = nodeGroup.append("g")
                    .attr("class", "svgContent")
                    ;
                g.html(v.svg);

                const contentBBox = (g.node() as SVGGraphicsElement).getBBox();
                const dx = cx - (contentBBox.x + contentBBox.width / 2);
                const dy = cy - (contentBBox.y + contentBBox.height / 2);
                g.attr("transform", `translate(${dx},${dy})`);
            }
        }
    }

    render(callback?: (w: Widget) => void) {

        return super.render(async w => {
            const dotWriter = new DotWriter(this._data);
            const { dot, customVertices } = dotWriter.writeGraph();
            if (this._prevDOT !== dot) {
                this._prevDOT = dot;
                const layout = await layoutCache.calcSVG(dot);
                if (isGraphvizWorkerResponse(layout)) {
                    this.renderSVG(layout.svg);
                    this.postrenderCustomVertices(customVertices);
                    this.zoomToFit(0);
                } else {
                    console.warn(`Graphviz layout failed: ${layout.error}, ${layout.errorDot}`);
                }
            }
            if (callback) {
                callback(this);
            }
        });
    }

    //  Events  ---
    selectionChanged() {
    }

    vertexButtonClicked(id: string, action: string) {
    }
}
Widget.prototype._class += " graph_GraphvizWidget";

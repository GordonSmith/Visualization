import { ID } from "@hpcc-js/util";
import { encodeID, encodeLabel, format } from "./util.ts";
import type { Store } from "./Store.ts";
import { CustomVertex, DotEx, EdgeStyle, type Edge, type Subgraph, type Vertex } from "./types.ts";

export interface DotWriterOptions {
    ignoreGlobalStoreOutEdges?: boolean;
    subgraphTpl?: string;
    activityTpl?: string;
    edgeTpl?: string;
}

const defaultDotWriterOptions: DotWriterOptions = {
    ignoreGlobalStoreOutEdges: true,
    subgraphTpl: "%id% - %TimeElapsed%",
    activityTpl: "%Label%",
    edgeTpl: "%Label%\n%NumRowsProcessed%\n%SkewMinRowsProcessed% / %SkewMaxRowsProcessed%"
};

export class DotWriter {

    protected _graph: Store;
    protected _options: DotWriterOptions = {};

    protected _dedupVertices: { [id: ID]: boolean } = {};
    protected _dedupEdges: { [scopeName: string]: boolean } = {};
    protected _dedupSubgraphs: { [scopeName: string]: boolean } = {};
    protected _svgContainer: HTMLDivElement | undefined;
    protected _svgElement: SVGSVGElement | undefined;

    constructor(graph: Store, options: DotWriterOptions = defaultDotWriterOptions) {
        this._graph = graph;
        this._options = options;
    }

    private _buildVertexTemplate(v: Vertex, isHidden: boolean = false): string {
        const g = this._graph;
        const vId = g.id(v);
        if (this._dedupVertices[vId] === true) return "";
        this._dedupVertices[vId] = true;

        const encodedId = encodeID(vId);
        const vertexClass = v.class ?? "";
        const rankAttr = isHidden ? " rank=\"min\"" : "";
        const colorAttr = v.stroke ? ` color="${v.stroke}"` : "";
        const fillcolorAttr = v.fill ? ` fillcolor="${v.fill}"` : "";

        if (v.svgTpl) {
            if (!this._svgContainer) {
                this._svgContainer = document.createElement("div");
                this._svgContainer.style.position = "absolute";
                this._svgContainer.style.left = "-9999px";
                this._svgContainer.style.top = "-9999px";
                this._svgContainer.style.visibility = "hidden";
                document.body.appendChild(this._svgContainer);
                this._svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                this._svgContainer.appendChild(this._svgElement);
            }
            const rendered = format(v.svgTpl, v as Record<string, any>);
            const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
            g.innerHTML = rendered;
            this._svgElement.appendChild(g);
            const bbox = g.getBBox();
            const padding = 4;
            v._svgTplWidth = bbox.width + padding;
            v._svgTplHeight = bbox.height + padding;
            v._svgTplConcrete = rendered;
            this._svgElement.removeChild(g);
            const w = v._svgTplWidth ? v._svgTplWidth / 72 : 1;
            const h = v._svgTplHeight ? v._svgTplHeight / 72 : 1;
            return `"${encodedId}" [id="${encodedId}" label="" shape="${v.shape ?? "rectangle"}" class="${vertexClass}" fixedsize=true width=${w} height=${h}${colorAttr}${fillcolorAttr}${rankAttr}]`;
        }

        const encodedLabel = encodeLabel(this._options.activityTpl ? format(this._options.activityTpl, v as Record<string, any>) || (v.label ?? vId) : (v.label ?? vId));
        const vertexShape = v.shape ?? "rectangle";

        return `"${encodedId}" [id="${encodedId}" label="${encodedLabel}" shape="${vertexShape}" class="${vertexClass}"${colorAttr}${fillcolorAttr}${rankAttr}]`;
    }

    writeVertex(v: Vertex): string {
        return this._buildVertexTemplate(v, false);
    }

    writeHiddenVertex(v: Vertex): string {
        return this._buildVertexTemplate(v, true);
    }

    writeEdge(e: Edge): string {
        const g = this._graph;
        const eId = g.id(e);
        if (this._dedupEdges[eId] === true) return "";
        this._dedupEdges[eId] = true;

        const sourceId = g.sourceID(e);
        const targetId = g.targetID(e);
        const sourceVertex = g.vertex(sourceId);
        const targetVertex = g.vertex(targetId);

        if (this._options.ignoreGlobalStoreOutEdges && sourceVertex) {
            const kind = (sourceVertex as Record<string, any>).Kind;
            if (kind === "22" || kind === 22) {
                return "";
            }
        }

        const ltail = g.subgraphExists(sourceId) ? `ltail=cluster_${sourceId}` : "";
        const lhead = g.subgraphExists(targetId) ? `lhead=cluster_${targetId}` : "";

        let edgeStyle = e.style;
        if (!edgeStyle && sourceVertex && targetVertex) {
            const sourceParent = g.vertexParent(sourceId);
            const targetParent = g.vertexParent(targetId);
            edgeStyle = sourceParent === targetParent ? EdgeStyle.solid : EdgeStyle.dashed;
        }

        const encodedID = encodeID(eId);
        const encodedSourceId = encodeID(sourceId);
        const encodedTargetId = encodeID(targetId);
        const encodedLabel = encodeLabel(this._options.edgeTpl ? format(this._options.edgeTpl, e as Record<string, any>) || (e.label ?? eId) : (e.label ?? eId));
        const colorAttr = e.stroke ? ` color="${e.stroke}"` : "";
        const fillcolorAttr = e.fill ? ` fillcolor="${e.fill}"` : "";
        const styleAttr = edgeStyle ? ` style="${edgeStyle}"` : "";
        const arrowheadAttr = e.arrowhead ? ` arrowhead="${e.arrowhead}"` : "";
        const arrowtailAttr = e.arrowtail ? ` arrowtail="${e.arrowtail}" dir="both"` : "";

        return `"${encodedSourceId}" -> "${encodedTargetId}" [id="${encodedID}" label="${encodedLabel}"${styleAttr}${colorAttr}${fillcolorAttr}${arrowheadAttr}${arrowtailAttr} ${ltail} ${lhead}]`;
    }

    writeSubgraph(sg: Subgraph): string {
        const g = this._graph;
        const sgId = g.id(sg);
        if (this._dedupSubgraphs[sgId]) return "";
        this._dedupSubgraphs[sgId] = true;

        const encodedId = encodeID(sgId);

        const childTpls: string[] = [];

        const subgraphs = g.subgraphSubgraphs(sgId);
        for (const child of subgraphs) {
            const childTpl = this.writeSubgraph(child);
            if (childTpl) childTpls.push(childTpl);
        }

        const vertices = g.subgraphVertices(sgId);
        for (const child of vertices) {
            childTpls.push(this.writeVertex(child));
        }

        const edges = g.subgraphEdges(sgId);
        for (const child of edges) {
            childTpls.push(this.writeEdge(child));
        }

        const label = encodeLabel(this._options.subgraphTpl ? format(this._options.subgraphTpl, sg as Record<string, any>) || (sg.label ?? g.id(sg)) : (sg.label ?? g.id(sg)));

        const colorAttr = sg.stroke ? `\n    color="${sg.stroke}";` : "";
        const fillcolorAttr = sg.fill ? `\n    fillcolor="${sg.fill}";` : "";

        return `\
subgraph cluster_${encodedId} {
    style="filled";
    id="${encodedId}";
    label="${label}";${colorAttr}${fillcolorAttr}

    ${childTpls.join("\n")}

}`;
    }

    writeGraph(selection: ID[] = []): DotEx {
        this._dedupSubgraphs = {};
        this._dedupVertices = {};
        this._dedupEdges = {};
        const g = this._graph;
        const childTpls: string[] = [];

        if (selection?.length) {
            const idSet = new Set(selection);

            for (const id of selection) {
                let subgraph: Subgraph | undefined;
                if (g.subgraphExists(id)) {
                    subgraph = g.subgraph(id);
                } else {
                    const item = g.item(id);
                    if (item?.parentID && g.subgraphExists(g.parentID(item)!)) {
                        subgraph = g.subgraph(g.parentID(item)!);
                    }
                }

                if (subgraph) {
                    childTpls.push(this.writeSubgraph(subgraph));
                }
            }

            for (const edge of g.allEdges()) {
                const sourceVertex = g.vertex(g.sourceID(edge));
                const targetVertex = g.vertex(g.targetID(edge));
                if (sourceVertex && targetVertex) {
                    const sourceParentId = g.parentID(sourceVertex);
                    const targetParentId = g.parentID(targetVertex);

                    if (sourceParentId && targetParentId &&
                        idSet.has(sourceParentId) &&
                        idSet.has(targetParentId)) {
                        childTpls.push(this.writeEdge(edge));
                    }
                }
            }
        } else {
            for (const sg of g.subgraphs()) {
                childTpls.push(this.writeSubgraph(sg));
            }
            for (const vertex of g.vertices()) {
                childTpls.push(this.writeVertex(vertex));
            }
            for (const edge of g.edges()) {
                childTpls.push(this.writeEdge(edge));
            }
        }

        if (this._svgContainer) {
            document.body.removeChild(this._svgContainer);
            this._svgContainer = undefined;
            this._svgElement = undefined;
        }

        const graph = g.graph();
        const defaultFontname = graph.defaultFontname ?? "Arial";
        graph.defaultSubgraphFontname = graph.defaultSubgraphFontname ?? defaultFontname;
        graph.defaultVertexFontname = graph.defaultVertexFontname ?? defaultFontname;
        graph.defaultEdgeFontname = graph.defaultEdgeFontname ?? defaultFontname;

        const graphAttrs: string[] = ['style="filled"'];
        if (graph.defaultSubgraphFontname) graphAttrs.push(`fontname="${graph.defaultSubgraphFontname}"`);
        if (graph.defaultSubgraphStroke) graphAttrs.push(`color="${graph.defaultSubgraphStroke}"`);
        if (graph.defaultSubgraphFill) graphAttrs.push(`fillcolor="${graph.defaultSubgraphFill}"`);

        const nodeAttrs: string[] = ['style="filled"', "margin=0.2"];
        if (graph.defaultVertexFontname ?? graph.defaultSubgraphFontname) nodeAttrs.push(`fontname="${graph.defaultVertexFontname ?? graph.defaultSubgraphFontname}"`);
        if (graph.defaultVertexStroke) nodeAttrs.push(`color="${graph.defaultVertexStroke}"`);
        if (graph.defaultVertexFill) nodeAttrs.push(`fillcolor="${graph.defaultVertexFill}"`);

        const edgeAttrs: string[] = [];
        if (graph.defaultEdgeFontname ?? graph.defaultSubgraphFontname) edgeAttrs.push(`fontname="${graph.defaultEdgeFontname ?? graph.defaultSubgraphFontname}"`);
        if (graph.defaultEdgeStroke) edgeAttrs.push(`color="${graph.defaultEdgeStroke}"`);
        if (graph.defaultEdgeFill) edgeAttrs.push(`fillcolor="${graph.defaultEdgeFill}"`);

        const dot = `\
digraph G {
    compound=true;
    ordering=in;
    graph [${graphAttrs.join(" ")}];
    node [${nodeAttrs.join(" ")}];
    edge [${edgeAttrs.join(" ")}];

    ${childTpls.join("\n")}

}`;
        const customVertices = g.allVertices().filter(v => !!v._svgTplConcrete).map(v => ({ encodedId: encodeID(g.id(v)), svg: v._svgTplConcrete }));
        return {
            dot,
            customVertices
        };
    }
}

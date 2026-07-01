import type { Store } from "./Store.ts";
import { type DotResult, type CustomVertex, type Edge, type Cluster, type Node, CLUSTER_DOT_ATTRS, EDGE_DOT_ATTRS, GRAPH_DOT_ATTRS, NODE_DOT_ATTRS } from "./types.ts";

const CUSTOM_VERTEX_DPI = 72;

export interface WriteGraphOptions {
    /** Vertex/subgraph IDs to include explicitly (preserves nesting). */
    selection?: string[];
    /** Subgraph IDs to use as roots of a partial view. Hidden edge endpoints
     *  become "ghost" expand-icons rendered outside the visible subgraphs. */
    subgraphs?: string[];
}

function formatDotId(value: string): string {
    return `"${String(value).replace(/"/g, "\\\"").replace(/\r?\n/g, "\\n")}"`;
}

function formatQuotedDotValue(value: unknown): string {
    return `"${String(value).replace(/"/g, "\\\"").replace(/\r?\n/g, "\\n")}"`;
}

function formatDotValue(name: string, value: unknown): string {
    if (typeof value === "boolean") return `${value}`;
    if (typeof value === "number") return `${value}`;
    if (name === "label" && typeof value === "string" && value[0] === "<" && value[value.length - 1] === ">") {
        return `${value}`;
    }
    return formatQuotedDotValue(value);
}

function collectAttrs(
    entity: Record<string, unknown>,
    attrNames: readonly string[],
    skip?: Set<string>
): string[] {
    const attrs: string[] = [];
    for (const name of attrNames) {
        if (skip?.has(name)) continue;
        const value = entity[name];
        if (value !== undefined && value !== null && (value !== "" || name === "label")) {
            attrs.push(`${name}=${formatDotValue(name, value)}`);
        }
    }
    return attrs;
}

export class DotWriter {

    protected _graph: Store;

    protected _dedupVertices: { [id: string]: boolean } = {};
    protected _dedupEdges: { [scopeName: string]: boolean } = {};
    protected _dedupSubgraphs: { [scopeName: string]: boolean } = {};
    protected _customVertices: CustomVertex[] = [];

    constructor(graph: Store) {
        this._graph = graph;
    }

    private writeRootChildren(graph: Store, writer: DotWriter, children: string[]): void {
        for (const sg of graph.subgraphSubgraphs(graph.rootSubgraph())) {
            children.push(writer.writeSubgraph(sg));
        }
        for (const vertex of graph.subgraphVertices(graph.rootSubgraph())) {
            children.push(writer.writeVertex(vertex));
        }
        for (const edge of graph.edges()) {
            children.push(writer.writeEdge(edge));
        }
    }

    private writeVertex(v: Node): string {
        const g = this._graph;
        const vId = g.id(v);
        if (this._dedupVertices[vId] === true) return "";
        this._dedupVertices[vId] = true;

        if ((v.svgContent || v.htmlContent) && v.svgWidth && v.svgHeight) {
            this._customVertices.push({ id: vId, svg: v.svgContent, html: v.htmlContent });
            const customNode: Node = {
                ...v,
                label: "",
                shape: v.shape ?? "rectangle",
                fixedsize: true,
                width: v.svgWidth / CUSTOM_VERTEX_DPI,
                height: v.svgHeight / CUSTOM_VERTEX_DPI
            };
            const customAttrs = collectAttrs(customNode as unknown as Record<string, unknown>, NODE_DOT_ATTRS);
            const allAttrs = [`id=${formatDotValue("id", vId)}`, ...customAttrs];
            return `${formatDotId(vId)} [${allAttrs.join(" ")}]`;
        }

        const nodeAttrs = collectAttrs(v as unknown as Record<string, unknown>, NODE_DOT_ATTRS);
        const allAttrs = [`id=${formatDotValue("id", vId)}`, ...nodeAttrs];

        return `${formatDotId(vId)} [${allAttrs.join(" ")}]`;
    }

    writeEdge(e: Edge): string {
        const g = this._graph;
        const eId = g.id(e);
        if (this._dedupEdges[eId] === true) return "";
        this._dedupEdges[eId] = true;

        const sourceId = g.sourceID(e);
        const targetId = g.targetID(e);

        const edgeAttrs = collectAttrs(e as unknown as Record<string, unknown>, EDGE_DOT_ATTRS);
        const allAttrs = [`id=${formatDotValue("id", eId)}`, ...edgeAttrs];
        const edgeOp = g.graph().type === "graph" ? "--" : "->";

        return `${formatDotId(sourceId)} ${edgeOp} ${formatDotId(targetId)} [${allAttrs.join(" ")}]`;
    }

    writeSubgraph(sg: Cluster): string {
        const g = this._graph;
        const sgId = g.id(sg);
        if (this._dedupSubgraphs[sgId]) return "";
        this._dedupSubgraphs[sgId] = true;

        const children: string[] = [];

        for (const child of g.subgraphSubgraphs(sg)) {
            const tpl = this.writeSubgraph(child);
            if (tpl) children.push(tpl);
        }
        for (const child of g.subgraphVertices(sg)) {
            children.push(this.writeVertex(child));
        }

        const isCluster = sg.cluster !== false;
        const skipAttrs = isCluster ? undefined : new Set(["cluster"]);
        const clusterAttrs = collectAttrs(sg as unknown as Record<string, unknown>, CLUSTER_DOT_ATTRS, skipAttrs);
        const subgraphName = formatDotId(isCluster ? `cluster_${sgId}` : sgId);
        const idAttr = isCluster ? [`id=${formatDotValue("id", sgId)}`] : [];
        const attrLines = [...idAttr, ...clusterAttrs].map(a => `\n    ${a};`).join("");

        return `\
subgraph ${subgraphName} {${attrLines}

    ${children.join("\n")}

}`;
    }

    writeGraph(): DotResult;
    writeGraph(selection: string[]): DotResult;
    writeGraph(options: WriteGraphOptions): DotResult;
    writeGraph(arg: string[] | WriteGraphOptions = []): DotResult {
        this._dedupSubgraphs = {};
        this._dedupVertices = {};
        this._dedupEdges = {};
        this._customVertices = [];
        const g = this._graph;
        const children: string[] = [];

        const options: WriteGraphOptions = Array.isArray(arg) ? { selection: arg } : arg;
        const selection = options.selection ?? [];
        const subgraphs = options.subgraphs ?? [];

        if (subgraphs.length) {
            const view = g.createPartialView(subgraphs);
            const viewWriter = new DotWriter(view);
            this.writeRootChildren(view, viewWriter, children);
            this._customVertices.push(...viewWriter._customVertices);
        } else if (selection.length) {
            const view = g.createView(selection);
            const viewWriter = new DotWriter(view);
            this.writeRootChildren(view, viewWriter, children);
            this._customVertices.push(...viewWriter._customVertices);
        } else {
            this.writeRootChildren(g, this, children);
        }

        const graph = g.graph();
        const graphAttrs = collectAttrs(graph as unknown as Record<string, unknown>, GRAPH_DOT_ATTRS);
        const graphAttrLines = graphAttrs.length > 0
            ? graphAttrs.map(a => `    ${a};`).join("\n") + "\n"
            : "";

        const nodeDefaults = graph.nodeDefaults
            ? collectAttrs(graph.nodeDefaults as unknown as Record<string, unknown>, NODE_DOT_ATTRS)
            : [];
        const nodeDefaultLine = nodeDefaults.length > 0
            ? `    node [${nodeDefaults.join(" ")}];\n`
            : "";

        const edgeDefaults = graph.edgeDefaults
            ? collectAttrs(graph.edgeDefaults as unknown as Record<string, unknown>, EDGE_DOT_ATTRS)
            : [];
        const edgeDefaultLine = edgeDefaults.length > 0
            ? `    edge [${edgeDefaults.join(" ")}];\n`
            : "";

        const graphDefaults = graph.graphDefaults
            ? collectAttrs(graph.graphDefaults as unknown as Record<string, unknown>, CLUSTER_DOT_ATTRS)
            : [];
        const graphDefaultLine = graphDefaults.length > 0
            ? `    graph [${graphDefaults.join(" ")}];\n`
            : "";

        const strictPrefix = graph.strict ? "strict " : "";

        const dot = `\
${strictPrefix}${graph.type ?? "digraph"} G {
${graphDefaultLine}${nodeDefaultLine}${edgeDefaultLine}
    ${children.join("\n")}
${graphAttrLines}
}`;
        return {
            dot,
            customVertices: this._customVertices
        };
    }
}

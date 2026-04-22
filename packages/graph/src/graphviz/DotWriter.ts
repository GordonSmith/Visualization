import type { Store } from "./Store.ts";
import { type DotResult, type CustomVertex, type Edge, type Cluster, type Node, CLUSTER_DOT_ATTRS, EDGE_DOT_ATTRS, GRAPH_DOT_ATTRS, NODE_DOT_ATTRS } from "./types.ts";

function formatDotValue(name: string, value: unknown): string {
    if (typeof value === "boolean") return `${value}`;
    if (typeof value === "number") return `${value}`;
    if (name === "label" && typeof value === "string" && value[0] === "<" && value[value.length - 1] === ">") {
        return `${value}`;
    }
    return `"${value}"`;
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

    private writeVertex(v: Node): string {
        const g = this._graph;
        const vId = g.id(v);
        if (this._dedupVertices[vId] === true) return "";
        this._dedupVertices[vId] = true;

        if ((v.svgContent || v.htmlContent) && v.svgWidth && v.svgHeight) {
            this._customVertices.push({ id: vId, svg: v.svgContent, html: v.htmlContent });
            const w = v.svgWidth / 72;
            const h = v.svgHeight / 72;
            const shape = v.shape ?? "rectangle";
            const colorAttr = v.color ? ` color="${v.color}"` : "";
            const fillcolorAttr = v.fillcolor ? ` fillcolor="${v.fillcolor}"` : "";
            return `"${vId}" [id="${vId}" label="" shape="${shape}" fixedsize=true width=${w} height=${h}${colorAttr}${fillcolorAttr}]`;
        }

        const nodeAttrs = collectAttrs(v as unknown as Record<string, unknown>, NODE_DOT_ATTRS);
        const allAttrs = [`id="${vId}"`, ...nodeAttrs];

        return `"${vId}" [${allAttrs.join(" ")}]`;
    }

    writeEdge(e: Edge): string {
        const g = this._graph;
        const eId = g.id(e);
        if (this._dedupEdges[eId] === true) return "";
        this._dedupEdges[eId] = true;

        const sourceId = g.sourceID(e);
        const targetId = g.targetID(e);

        const edgeAttrs = collectAttrs(e as unknown as Record<string, unknown>, EDGE_DOT_ATTRS);
        const allAttrs = [`id="${eId}"`, ...edgeAttrs];

        return `"${sourceId}" -> "${targetId}" [${allAttrs.join(" ")}]`;
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
        const subgraphName = isCluster ? `cluster_${sgId}` : sgId;
        const idAttr = isCluster ? [`id="${sgId}"`] : [];
        const attrLines = [...idAttr, ...clusterAttrs].map(a => `\n    ${a};`).join("");

        return `\
subgraph ${subgraphName} {${attrLines}

    ${children.join("\n")}

}`;
    }

    writeGraph(selection: string[] = []): DotResult {
        this._dedupSubgraphs = {};
        this._dedupVertices = {};
        this._dedupEdges = {};
        this._customVertices = [];
        const g = this._graph;
        const children: string[] = [];

        if (selection?.length) {
            const view = g.createView(selection);
            const viewWriter = new DotWriter(view);
            for (const sg of view.subgraphs()) {
                children.push(viewWriter.writeSubgraph(sg));
            }
            for (const vertex of view.vertices()) {
                children.push(viewWriter.writeVertex(vertex));
            }
            for (const edge of view.edges()) {
                children.push(viewWriter.writeEdge(edge));
            }
            this._customVertices.push(...viewWriter._customVertices);
        } else {
            for (const sg of g.subgraphs()) {
                children.push(this.writeSubgraph(sg));
            }
            for (const vertex of g.vertices()) {
                children.push(this.writeVertex(vertex));
            }
            for (const edge of g.edges()) {
                children.push(this.writeEdge(edge));
            }
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

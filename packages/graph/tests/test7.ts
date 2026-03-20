import { Graphviz } from "../src/index.ts";

const arrowTypes = Object.values(Graphviz.ArrowType);
const edgeStyles = Object.values(Graphviz.EdgeStyle);
const shapes = Object.values(Graphviz.Shapes);

// --- Subgraph 1: Arrow type combos (vertices are shape "none", labeled with arrow name) ---
const arrowVertices: Graphviz.Vertex[] = arrowTypes.flatMap((arrow, i) => [
    { id: `a${i}s`, label: arrow, shape: Graphviz.Shapes.none, parentID: "sgArrows" },
    { id: `a${i}t`, label: arrow, shape: Graphviz.Shapes.none, parentID: "sgArrows" },
]);
const arrowEdges: Graphviz.Edge[] = arrowTypes.map((arrow, i) => ({
    id: `ea${i}`,
    sourceID: `a${i}s`,
    targetID: `a${i}t`,
    label: `${arrow} / ${edgeStyles[i % edgeStyles.length]}`,
    style: edgeStyles[i % edgeStyles.length],
    arrowhead: arrow,
    arrowtail: arrow,
}));

// --- Subgraph 2: All vertex shapes ---
const shapeVertices: Graphviz.Vertex[] = shapes.map((shape, i) => ({
    id: `s${i}`,
    label: shape,
    shape,
    parentID: "sgShapes",
}));
const shapeEdges: Graphviz.Edge[] = shapeVertices.slice(0, -1).map((_, i) => ({
    id: `es${i}`,
    sourceID: `s${i}`,
    targetID: `s${i + 1}`,
}));

// --- Subgraph 3: Custom SVG content vertices ---
const customVertices: Graphviz.Vertex[] = [
    {
        id: "c1", label: "Custom 1", parentID: "sgCustom",
        svgTpl: `<g>
            <circle cx="18" cy="13" r="9" fill="white" fill-opacity="0.25"/>
            <path d="M14,11 L18,7 L22,11 M18,7 L18,18 M13,18 L23,18" stroke="black" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            <text x="34" y="17" font-family="arial" font-size="11" font-weight="bold" fill="white">%label%</text>
            <text x="14" y="42" font-family="arial" font-size="10" fill="var(--gv-fg)">ID: %id%</text>
            <text x="14" y="58" font-family="arial" font-size="9" fill="#888">Ready</text>
            <circle cx="164" cy="56" r="6" fill="#0e7a0d"/>
            <path d="M161,56 L163,58 L167,54" stroke="white" stroke-width="1.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        </g>`
    },
    {
        id: "c2", label: "Custom 3", parentID: "sgCustom", stroke: "white",
        svgTpl: `<g>
            <rect x="0" y="0" width="640" height="480" rx="8" fill="#f9dede" stroke="transparent" stroke-width="2"/>
            <text x="60" y="20" text-anchor="middle" font-family="arial" font-size="11" fill="#242424">%label%</text>
            <text x="60" y="38" text-anchor="middle" font-family="arial" font-size="10" fill="#666">ID: %id%</text>
        </g>`
    },
    {
        id: "c3", label: "Custom 2", parentID: "sgCustom", shape: Graphviz.Shapes.circle,
        svgTpl: `<g>
            <circle cx="20" cy="20" r="18" fill="#4cc2ff" stroke="var(--gv-fg)" stroke-width="2"/>
            <text x="20" y="25" text-anchor="middle" font-family="arial" font-size="12" fill="white">%id%</text>
        </g>`
    },

];
const customEdges: Graphviz.Edge[] = [
    { id: "ec1", sourceID: "c1", targetID: "c2" },
    { id: "ec2", sourceID: "c2", targetID: "c3" },
];

const VERTEX_ARR: Graphviz.Vertex[] = [...arrowVertices, ...shapeVertices, ...customVertices];
const EDGE_ARR: Graphviz.Edge[] = [...arrowEdges, ...shapeEdges, ...customEdges];

const SUBGRAPH_ARR: Graphviz.Subgraph[] = [
    { id: "sgArrows", label: "Arrow Types" },
    { id: "sgShapes", label: "Vertex Shapes" },
    { id: "sgCustom", label: "Custom SVG Content" },
];

const GRAPH: Graphviz.Graph = {
    // defaultVertexFill: "white",
    // defaultVertexStroke: "#FF0000",
    // defaultEdgeStroke: "#00FF00",
    // defaultSubgraphFill: "#fcfcfc",
    // defaultSubgraphStroke: "#0000FF"
};

const store = new Graphviz.Store();
store.load(VERTEX_ARR, EDGE_ARR, SUBGRAPH_ARR, GRAPH);

export class Test7 extends Graphviz.Widget {

    constructor() {
        super();
        this.prerenderCustomVertices(store.allVertices());
        const dotWriter = new Graphviz.DotWriter(store);
        const dot = dotWriter.writeGraph();
        const layout = Graphviz.layoutCache.calcSVG(dot);
        layout.then(response => {
            if ("svg" in response) {
                this
                    .svg(response.svg)
                    .lazyRender()
                    ;
            }

        });
    }
}

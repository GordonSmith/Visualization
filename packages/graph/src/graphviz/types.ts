import { EdgeT, SubgraphT, VertexT } from "@hpcc-js/util";

export enum Shape {
    box = "box",
    polygon = "polygon",
    ellipse = "ellipse",
    oval = "oval",
    circle = "circle",
    point = "point",
    egg = "egg",
    triangle = "triangle",
    plaintext = "plaintext",
    plain = "plain",
    diamond = "diamond",
    trapezium = "trapezium",
    parallelogram = "parallelogram",
    house = "house",
    pentagon = "pentagon",
    hexagon = "hexagon",
    septagon = "septagon",
    octagon = "octagon",
    doublecircle = "doublecircle",
    doubleoctagon = "doubleoctagon",
    tripleoctagon = "tripleoctagon",
    invtriangle = "invtriangle",
    invtrapezium = "invtrapezium",
    invhouse = "invhouse",
    Mdiamond = "Mdiamond",
    Msquare = "Msquare",
    Mcircle = "Mcircle",
    rect = "rect",
    rectangle = "rectangle",
    square = "square",
    star = "star",
    none = "none",
    underline = "underline",
    cylinder = "cylinder",
    note = "note",
    tab = "tab",
    folder = "folder",
    box3d = "box3d",
    component = "component",
    promoter = "promoter",
    cds = "cds",
    terminator = "terminator",
    utr = "utr",
    primersite = "primersite",
    restrictionsite = "restrictionsite",
    fivepoverhang = "fivepoverhang",
    threepoverhang = "threepoverhang",
    noverhang = "noverhang",
    assembly = "assembly",
    signature = "signature",
    insulator = "insulator",
    ribosite = "ribosite",
    rnastab = "rnastab",
    proteasesite = "proteasesite",
    proteinstab = "proteinstab",
    rpromoter = "rpromoter",
    rarrow = "rarrow",
    larrow = "larrow",
    lpromoter = "lpromoter"
};

export enum EdgeStyle {
    solid = "solid",
    dashed = "dashed",
    dotted = "dotted",
    bold = "bold",
    invis = "invis",
    tapered = "tapered"
}

export enum ArrowType {
    normal = "normal",
    inv = "inv",
    dot = "dot",
    invdot = "invdot",
    odot = "odot",
    invodot = "invodot",
    none = "none",
    tee = "tee",
    empty = "empty",
    invempty = "invempty",
    diamond = "diamond",
    odiamond = "odiamond",
    ediamond = "ediamond",
    crow = "crow",
    box = "box",
    obox = "obox",
    open = "open",
    halfopen = "halfopen",
    vee = "vee"
}

export interface Graph {
    defaultFontname?: string;
    defaultSubgraphFill?: string;
    defaultSubgraphStroke?: string;
    defaultSubgraphFontname?: string;
    defaultVertexFill?: string;
    defaultVertexStroke?: string;
    defaultVertexFontname?: string;
    defaultEdgeFill?: string;
    defaultEdgeStroke?: string;
    defaultEdgeFontname?: string;
}

export interface Subgraph extends SubgraphT {
    label?: string;
    fill?: string;
    stroke?: string;
    attrs?: Record<string, any>;
}

export interface Vertex extends VertexT {
    label?: string;
    shape?: Shape;
    fill?: string;
    stroke?: string;
    class?: string;
    svgTpl?: string;
    attrs?: Record<string, any>;

    // For internal use only - not part of the public API
    _svgTplWidth?: number;
    _svgTplHeight?: number;
    _svgTplConcrete?: string;
}

export interface Edge extends EdgeT {
    label?: string;
    style?: EdgeStyle;
    arrowhead?: ArrowType;
    arrowtail?: ArrowType;
    fill?: string;
    stroke?: string;
    attrs?: Record<string, any>;
}

export interface CustomVertex {
    encodedId: string;
    svg: string;
}

export interface DotEx {
    dot: string,
    customVertices: CustomVertex[]
}
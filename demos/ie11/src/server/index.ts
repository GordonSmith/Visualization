import { devData, GraphDB, RawDataT } from "./graphdb";

export { Edge, Vertex, VertexType, RawDataT } from "./graphdb";

let m_rawData = devData;
const db = new GraphDB()
    .load(m_rawData)
    ;

export function rawData(): RawDataT;
export function rawData(_?: RawDataT): void;
export function rawData(_?: RawDataT): RawDataT | void {
    if (!arguments.length) return m_rawData;
    m_rawData = _;
    db.load(_);
}

export function fetchGraph(memberID?: number, depth: number = 1) {
    const subgraph = db.subgraph(memberID, depth);
    return Promise.resolve({
        vertices: subgraph.vertices(),
        edges: subgraph.edges()
    });
}

export function fetchCompanies() {
    return Promise.resolve(db.companies());
}

export function fetchPeople() {
    return Promise.resolve(db.people());
}

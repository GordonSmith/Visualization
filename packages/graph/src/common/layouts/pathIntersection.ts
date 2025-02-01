export interface Pos {
    x: number;
    y: number;
}

export interface Segment {
    start: Pos;
    end: Pos;
}

function segmentIntersection(s1: Segment, s2: Segment) {
    const { x: x1, y: y1 } = s1.start;
    const { x: x2, y: y2 } = s1.end;
    const { x: x3, y: y3 } = s2.start;
    const { x: x4, y: y4 } = s2.end;

    const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (denom === 0) return null; // Parallel lines

    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;

    if (t > 0 && t < 1 && u > 0 && u < 1) {
        return {
            x: x1 + t * (x2 - x1),
            y: y1 + t * (y2 - y1)
        };
    }

    return null; // No intersection
}

export interface Rectangle {
    x: number;
    y: number;
    w: number;
    h: number;
}

function rectEdges(rect: Rectangle) {
    const r = {
        topLeft: { x: rect.x - rect.w / 2, y: rect.y - rect.h / 2 },
        topRight: { x: rect.x + rect.w / 2, y: rect.y - rect.h / 2 },
        bottomRight: { x: rect.x + rect.w / 2, y: rect.y + rect.h / 2 },
        bottomLeft: { x: rect.x - rect.w / 2, y: rect.y + rect.h / 2 }
    };
    return [
        { start: r.topLeft, end: r.topRight },
        { start: r.topRight, end: r.bottomRight },
        { start: r.bottomRight, end: r.bottomLeft },
        { start: r.bottomLeft, end: r.topLeft }
    ];
}

export function rectangleIntersection(rect: Rectangle, line: Segment) {
    for (const edge of rectEdges(rect)) {
        const intersectionPoint = segmentIntersection(edge, line);
        if (intersectionPoint) return intersectionPoint;
    }
    return null;
}

import type { HTMLTemplateResult, SVGTemplateResult } from "lit-html";

export type TemplateResult = HTMLTemplateResult | SVGTemplateResult;
export interface Pos {
    x: number;
    y: number;
}
export interface Segment {
    start: Pos;
    end: Pos;
}
export interface Size {
    width: number;
    height: number;
}
export type IntersectionFunc = (line: Segment) => Pos | null;
export type TemplateResultEx = TemplateResult & {
    extent?: Size;
    intersection: IntersectionFunc;
};
export function extend(result: TemplateResult, width: number, height: number, intersection: IntersectionFunc = (line: Segment) => null): TemplateResultEx {
    return {
        ...result,
        extent: { width, height },
        intersection
    };
}
export type Component<T> = (props: T) => TemplateResult;


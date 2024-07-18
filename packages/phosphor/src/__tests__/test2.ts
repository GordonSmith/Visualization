import { DockPanel } from "../DockPanel";
import { Area, Line, Bubble } from "@hpcc-js/chart";

const columns = ["Subject", "Result"];
const data = [
    ["English", 45],
    ["Irish", 28],
    ["Math", 98],
    ["Geography", 48],
    ["Science", 82]
];
const area = new Area()
    .columns(columns)
    .data(data)
    ;
const line = new Line()
    .columns(columns)
    .data(data)
    ;
const bubble = new Bubble()
    .columns(columns)
    .data(data)
    ;

export class Test2 extends DockPanel {

    constructor() {
        super();
    }

    initTest() {
        this
            .addWidget(area, "<drag me>")
            .addWidget(bubble, "<drag me>", "split-right", area)
            .addWidget(line, "<drag me>", "split-bottom", area)
            ;
        return this;
    }
}


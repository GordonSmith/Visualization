import { Dashboard, Dashy, ElementContainer } from "../src/index.ts";
import { sample } from "./sample.ts";

window.addEventListener("resize", doResize);

function doResize() {
    let myWidth;
    let myHeight;
    if (typeof (window.innerWidth) === "number") {
        myWidth = window.innerWidth;
        myHeight = window.innerHeight;
    } else {
        if (document.documentElement && (document.documentElement.clientWidth || document.documentElement.clientHeight)) {
            myWidth = document.documentElement.clientWidth;
            myHeight = document.documentElement.clientHeight;
        } else {
            if (document.body && (document.body.clientWidth || document.body.clientHeight)) {
                myWidth = document.body.clientWidth;
                myHeight = document.body.clientHeight;
            }
        }
    }
    if (widget && myWidth && myHeight) {
        widget
            .resize({ width: myWidth - 16, height: myHeight - 16 })
            .lazyRender();
    }
}

let widget: Dashy | Dashboard;

export function loadDashy(target: string) {
    widget = new Dashy()
        .target(target)
        .render()
        ;
    doResize();
}

export function loadDashboard(target: string) {
    const ec = new ElementContainer();
    widget = new Dashboard(ec);
    widget
        .target(target)
        .titleVisible(false)
        .hideSingleTabs(true)
        .restore(sample as any)
        .render(w => {
            ec.refresh();
        })
        ;
    doResize();
}

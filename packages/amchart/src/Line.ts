import { INDChart } from "@hpcc-js/api";
import { CommonSerial } from "./CommonSerial";

export function Line() {
    CommonSerial.call(this);
    this._tag = "div";
    this._gType = "line";
}
Line.prototype = Object.create(CommonSerial.prototype);
Line.prototype.constructor = Line;
Line.prototype._class += " amchart_Line";
Line.prototype.implements(INDChart.prototype);

Line.prototype.publish("paletteID", "default", "set", "Palette ID", Line.prototype._palette.switch(), { tags: ["Basic", "Shared"] });
Line.prototype.publish("smoothLines", false, "boolean", "Causes chart data lines to draw smoothly", null, { tags: ["Basic", "Shared"] });

Line.prototype.publish("stepLines", false, "boolean", "Causes chart data lines to draw smoothly", null, { tags: ["Basic"] });

Line.prototype.publish("bulletSize", 6, "number", "Bullet Size", null, { tags: ["Intermediate"] });
Line.prototype.publish("bulletType", "round", "set", "Bullet Type", ["none", "round", "square", "triangleUp", "triangleDown", "triangleLeft", "triangleRight", "bubble", "diamond"], { tags: ["Basic"] });

Line.prototype.enter = function (domNode, element) {
    CommonSerial.prototype.enter.apply(this, arguments);
};

Line.prototype.updateChartOptions = function () {
    CommonSerial.prototype.updateChartOptions.apply(this, arguments);

    this.buildGraphs(this._gType);

    return this._chart;
};

Line.prototype.buildGraphs = function (gType) {
    this._chart.graphs = [];

    for (let i = 0; i < this.columns().length - 1; i++) {
        const gRetVal = CommonSerial.prototype.buildGraphObj.call(this, gType, i);
        const gObj = buildGraphObj.call(this, gRetVal, i);

        this._chart.addGraph(gObj);
    }

    function buildGraphObj(gObj, i) {
        if (this.stepLines()) {
            gObj.type = "step";
        } else if (this.smoothLines()) {
            gObj.type = "smoothedLine";
        } else {
            gObj.type = "line";
        }

        gObj.bullet = this.bulletType();
        gObj.bulletSize = this.bulletSize();

        return gObj;
    }
};

Line.prototype.update = function (domNode, element) {
    CommonSerial.prototype.update.apply(this, arguments);

    this.updateChartOptions();

    this._chart.validateNow();
    this._chart.validateData();
};

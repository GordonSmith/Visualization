import * as d3 from "d3"
import * as D3Bullet from "d3-bullet"
import * as HTMLWidget from "../common/HTMLWidget"
import * as Utility from "../common/Utility"
import "css!./Bullet"

D3Bullet = D3Bullet || d3.bullet || window.d3.bullet;

export default class Bullet extends HTMLWidget {
    constructor() {
        super();
        HTMLWidget.call(this);
        Utility.SimpleSelectionMixin.call(this, true);
    }

    bulletData() {
        var columns = this.columns();
        return this.data().map(function (row) {
            return {
                title: valueOf(row, this.titleColumn()),
                subtitle: valueOf(row, this.subtitleColumn()),
                ranges: valueOf(row, this.rangesColumn()),
                measures: valueOf(row, this.measuresColumn()),
                markers: valueOf(row, this.markersColumn()),
                origRow: row
            };
        }, this);

        function valueOf(row, column) {
            var colIdx = columns.indexOf(column);
            if (colIdx >= 0) {
                if (row[colIdx] instanceof Array) {
                    return row[colIdx];
                }
                return [row[colIdx]];
            }
            return [];
        }
    };

    enter(domNode, element) {
        super.enter(...arguments);
        d3.select(domNode.parentNode).style("overflow", "auto");
        this._selection.widgetElement(element);
    };

    update(domNode, element) {
        super.update(...arguments);
        var context = this;

        var margin = { top: 8, right: 16, bottom: 20, left: 16 },
            width = this.width() - margin.left - margin.right,
            height = 50 - margin.top - margin.bottom;

        var svg = element.selectAll("svg").data(this.bulletData());
        svg.enter().append("svg")
            .attr("class", "bullet")
            .call(this._selection.enter.bind(this._selection))
            .on("click", function (d) {
                context.click(context.rowToObj(d.origRow), context.titleColumn(), context._selection.selected(this));
            })
            .on("dblclick", function (d) {
                context.dblclick(context.rowToObj(d.origRow), context.titleColumn(), context._selection.selected(this));
            })
            .each(function (d) {
                var element = d3.select(this);
                var bulletBar = element.append("g")
                    .attr("class", "bulletBar")
                    ;
                var bulletTitle = bulletBar.append("g")
                    .attr("class", "bulletTitle")
                    ;
                bulletTitle.append("text")
                    .attr("class", "title")
                    ;
                bulletTitle.append("text")
                    .attr("class", "subtitle")
                    .attr("dy", "1em")
                    ;
            })
            ;

        //  Title ---
        var title = svg.select(".bulletTitle")
            .style("text-anchor", "end")
            .attr("transform", "translate(-6," + height / 2 + ")")
            ;
        title.select(".title")
            .text(function (d) { return d.title; })
            ;
        title.select(".subtitle")
            .text(function (d) { return d.subtitle; })
            ;
        var titleWidth = 0;
        title.each(function () {
            var bbox = this.getBBox();
            if (bbox.width > titleWidth) {
                titleWidth = bbox.width;
            }
        });

        //  Bullet Chart ---
        var chart = new D3Bullet()
            .width(width - titleWidth)
            .height(height)
            ;
        svg
            .attr("width", width)
            .attr("height", height + margin.top + margin.bottom)
            ;
        svg.select(".bulletBar")
            .attr("transform", "translate(" + (titleWidth + margin.left) + "," + margin.top + ")")
            .call(chart)
            ;
        svg.exit().remove();
    }

    exit(domNode, element) {
        super.exit(...arguments);
    }

    //  Events ---
    click(row, column, selected) {
        console.log("Click:  " + JSON.stringify(row) + ", " + column + "," + selected);
    }

    dblclick(row, column, selected) {
        console.log("Double click:  " + JSON.stringify(row) + ", " + column + "," + selected);
    }
}
Bullet.prototype._class += " chart_Bullet";

Bullet.prototype.publish("titleColumn", null, "set", "Title Column", function () { return this.columns(); }, { optional: true });
Bullet.prototype.publish("subtitleColumn", null, "set", "Subtitle Column", function () { return this.columns(); }, { optional: true });
Bullet.prototype.publish("rangesColumn", null, "set", "Ranges Column", function () { return this.columns(); }, { optional: true });
Bullet.prototype.publish("measuresColumn", null, "set", "Measures Column", function () { return this.columns(); }, { optional: true });
Bullet.prototype.publish("markersColumn", null, "set", "Markers Column", function () { return this.columns(); }, { optional: true });

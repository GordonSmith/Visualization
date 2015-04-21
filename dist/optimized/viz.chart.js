
(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define('chart/I2DChart.js',["../common/Palette"], factory);
    } else {
        root.chart_I2DChart = factory(root.common_Palette);
    }
}(this, function (Palette) {
    function I2DChart() {
    };
    I2DChart.prototype._palette = Palette.ordinal("default");

    //  Data ---
    I2DChart.prototype.testData = function () {
        this.columns(["Subject", "2nd Year"]);
        this.data([
            ["Geography", 75],
            ["English", 45],
            ["Math", 98],
            ["Science", 66]
        ]);
        return this;
    };

    //  Events  ---
    I2DChart.prototype.click = function (row, column) {
        console.log("Click:  " + JSON.stringify(row) + ", " + column);
    };

    return I2DChart;
}));

if (typeof define === "function" && define.amd) {
  define('css',[], function () { 
    return {
      load: function ($1, $2, load) { load() }
    } 
  })
};


(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define('chart/Bubble.js',["d3/d3", "../common/SVGWidget", "./I2DChart", "../common/Text", "../common/FAChar", "css!./Bubble"], factory);
    } else {
        root.chart_Bubble = factory(root.d3, root.common_SVGWidget, root.chart_I2DChart, root.common_Text, root.common_FAChar);
    }
}(this, function (d3, SVGWidget, I2DChart, Text, FAChar) {
    function Bubble(target) {
        SVGWidget.call(this);
        I2DChart.call(this);
        this._class = "chart_Bubble";

        this.labelWidgets = {};

        this.d3Pack = d3.layout.pack()
            .sort(function (a, b) { return a < b ? -1 : a > b ? 1 : 0; })
            .size([this.width(), this.height()])
            .value(function (d) { return d[1]; })
        ;
    };
    Bubble.prototype = Object.create(SVGWidget.prototype);
    Bubble.prototype.implements(I2DChart.prototype);

    Bubble.prototype.publish("paletteID", "default", "set", "Palette ID", Bubble.prototype._palette.switch());

    Bubble.prototype.size = function (_) {
        var retVal = SVGWidget.prototype.size.apply(this, arguments);
        if (arguments.length) {
            this.d3Pack
                .size([this.width(), this.height()])
            ;
        }
        return retVal;
    };

    Bubble.prototype.update = function (domNode, element) {
        var context = this;

        this._palette = this._palette.switch(this._paletteID);
        var node = element.selectAll(".node")
            .data(this._data.length ? this.d3Pack.nodes({ children: this.cloneData() }).filter(function (d) { return !d.children; }) : [], function (d) { return d[0]; })
        ;

        //  Enter  ---
        node.enter().append("g")
            .attr("class", "node")
            .attr("opacity", 0)
            .on("click", function (d) {
                context.click(context.rowToObj(d), context._columns[1]);
            })
            .each(function (d) {
                var element = d3.select(this);
                element.append("circle")
                    .attr("r", function (d) { return d.r; })
                    .append("title")
                ;
                if (d.__viz_faChar) {
                    context.labelWidgets[d[0]] = new FAChar()
                        .char(d.__viz_faChar)
                        .target(this)
                        .render()
                    ;
                } else {
                    context.labelWidgets[d[0]] = new Text()
                        .text(d[0])
                        .target(this)
                        .render()
                    ;
                }
            })
        ;

        //  Update  ---
        node.transition()
            .attr("opacity", 1)
            .each(function (d) {
                var element = d3.select(this);
                var pos = { x: d.x - context._size.width / 2, y: d.y - context._size.height / 2 }
                element.select("circle").transition()
                    .attr("transform", function (d) { return "translate(" + pos.x + "," + pos.y + ")"; })
                    .style("fill", function (d) { return context._palette(d[0]); })
                    .attr("r", function (d) { return d.r; })
                    .select("title")
                        .text(function (d) { return d[0] + " (" + d[1] + ")"; })
                ;
                if (d.__viz_faChar) {
                    context.labelWidgets[d[0]]
                        .pos(pos)
                        .render()
                    ;
                } else {
                    var label = d[0];
                    var labelWidth = context.labelWidgets[d[0]].getBBox().width;
                    if (d.r * 2 < 16) {
                        label = "";
                    } else if (d.r * 2 < labelWidth) {
                        label = label[0] + "...";
                    }
                    context.labelWidgets[d[0]]
                        .pos(pos)
                        .text(label)
                        .render()
                    ;
                }
            })
        ;

        //  Exit  ---
        node.exit().transition()
            .style("opacity", 0)
            .remove()
        ;
    };

    return Bubble;
}));


(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define('chart/XYAxis.js',["d3/d3", "../common/SVGWidget"], factory);
    } else {
        root.chart_XYAxis = factory(root.d3, root.common_SVGWidget);
    }
}(this, function (d3, SVGWidget) {
    function XYAxis(target) {
        SVGWidget.call(this);

        this._xScale = "";
        this.parseDate = d3.time.format("%Y-%m-%d").parse;
    };
    XYAxis.prototype = Object.create(SVGWidget.prototype);

    XYAxis.prototype.xScale = function (_) {
        if (!arguments.length) return this._xScale;
        this._xScale = _;
        return this;
    };

    XYAxis.prototype.enter = function (domNode, element) {
        var context = this;

        this.x = null;
        switch (this._xScale) {
            case "DATE":
                this.x = d3.time.scale();
                break;
            default:
                this.x = d3.scale.ordinal();
                break;
        }
        this.y = d3.scale.linear();

        this.xAxis = d3.svg.axis()
            .orient("bottom")
            .scale(this.x)
        ;

        this.yAxis = d3.svg.axis()
            .orient("left")
            .scale(this.y)
            .tickFormat(d3.format(".2s"))
            .ticks(10)
        ;

        this.recenterG = element.append("g");
        this.svg = this.recenterG.append("g");
        this.svgData = this.svg.append("g");
        this.svgXAxis = this.svg.append("g")
            .attr("class", "x axis")
        ;
        this.svgYAxis = this.svg.append("g")
            .attr("class", "y axis")
        ;
    };

    XYAxis.prototype.calcMargin = function (domNode, element) {
        var context = this;
        var margin = { top: 8, right: 0, bottom: 24, left: 40 };
        var width = this.width() - margin.left - margin.right,
            height = this.height() - margin.top - margin.bottom;

        var test = element.append("g");

        var svgXAxis = test.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(this.xAxis)
        ;
        var svgYAxis = test.append("g")
            .attr("class", "y axis")
            .call(this.yAxis)
        ;

        var x_bbox = svgXAxis.node().getBBox();
        var y_bbox = svgYAxis.node().getBBox();
        margin.bottom = x_bbox.height;
        margin.left = y_bbox.width;
        test.remove();
        return margin;
    }

    XYAxis.prototype.update = function (domNode, element) {
        var context = this;

        //  Update Domain  ---
        switch (this._xScale) {
            case "DATE":
                var min = d3.min(this._data, function (data) {
                    return d3.min(data, function (d) { return context.parseDate(d[0]); });
                });
                var max = d3.max(this._data, function (data) {
                    return d3.max(data, function (d) { return context.parseDate(d[0]); });
                });
                this.x.domain([min, max]);
                break;
            default:
                this.x.domain(this._data.map(function (d) { return d[0]; }));
                break;
        }
        var min = d3.min(this._data, function (data) {
            return d3.min(data.filter(function (cell, i) { return i > 0 && context._columns[i] && context._columns[i].indexOf("__") !== 0; }), function (d) { return d; });
        });
        var max = d3.max(this._data, function (data) {
            return d3.max(data.filter(function (row, i) { return i > 0 && context._columns[i] && context._columns[i].indexOf("__") !== 0; }), function (d) { return d; });
        });
        var newMin = min - (max - min) / 10;
        if (min >= 0 && newMin < 0)
            newMin = 0;
        this.y.domain([newMin, max]);

        //  Calculate Range  ---
        if (this.x.rangeRoundBands) {
            this.x.rangeRoundBands([0, this.width()], .1);
        } else if (this.x.rangeRound) {
            this.x.range([0, this.width()]);
        }
        this.y.range([this.height(), 0]);
        var margin = this.calcMargin(domNode, element);

        //  Update Range  ---
        var width = this.width() - margin.left - margin.right,
            height = this.height() - margin.top - margin.bottom;

        if (this.x.rangeRoundBands) {
            this.x.rangeRoundBands([0, width], .1);
        } else if (this.x.rangeRound) {
            this.x.range([0, width]);
        }
        this.y.range([height, 0]);

        //  Render  ---
        this.svg.transition()
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        ;

        this.svgXAxis.transition()
            .attr("transform", "translate(0," + height + ")")
            .call(this.xAxis)
        ;

        this.svgYAxis.transition()
            .call(this.yAxis)
        ;

        this.updateChart(domNode, element, margin, width, height);

        this.recenterG.transition()
            .attr("transform", "translate(" + -this.width() / 2 + "," + -this.height() / 2 + ")")
        ;
    };

    XYAxis.prototype.updateChart = function (domNode, element, margin, width, height) {
    };

    return XYAxis;
}));



(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define('chart/Column.js',["d3/d3", "./XYAxis", "./I2DChart", "css!./Column"], factory);
    } else {
        root.chart_Column = factory(root.d3, root.chart_XYAxis, root.chart_I2DChart);
    }
}(this, function (d3, XYAxis, I2DChart) {
    function Column(target) {
        XYAxis.call(this);
        I2DChart.call(this);
        this._class = "chart_Column";
    };
    Column.prototype = Object.create(XYAxis.prototype);
    Column.prototype.implements(I2DChart.prototype);

    Column.prototype.publish("paletteID", "default", "set", "Palette ID", Column.prototype._palette.switch());

    Column.prototype.updateChart = function (domNode, element, margin, width, height) {
        var context = this;

        this._palette = this._palette.switch(this._paletteID);

        var column = this.svgData.selectAll(".columnRect")
            .data(this._data)
        ;

        var title = column
          .enter().append("rect")
            .attr("class", "columnRect")
            .on("click", function (d) {
                context.click(context.rowToObj(d), context._columns[1]);
            })
            .append("title")
        ;

        column.transition()
            .attr("class", "columnRect")
            .attr("x", function (d) { return context.x(d[0]); })
            .attr("width", this.x.rangeBand())
            .attr("y", function (d) { return context.y(d[1]); })
            .attr("height", function (d) { return height - context.y(d[1]); })
            .style("fill", function (d) { return context._palette(d[0]); })
        ;

        title
            .text(function (d) { return d[0] + " (" + d[1] + ")"; })
        ;

        column.exit().transition()
            .remove()
        ;
    };

    return Column;
}));


(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define('chart/I1DChart.js',["../common/Palette"], factory);
    } else {
        root.chart_I1DChart = factory(root.common_Palette);
    }
}(this, function (Palette) {
    function I1DChart() {
    };
    I1DChart.prototype._palette = Palette.rainbow("default");

    //  Data ---
    I1DChart.prototype.testData = function () {
        this.columns("Result");
        this.data(66);
        return this;
    };

    //  Events  ---
    I1DChart.prototype.click = function (row, column) {
        console.log("Click:  " + JSON.stringify(row) + ", " + column);
    };

    return I1DChart;
}));


(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define('chart/INDChart',["../common/Palette"], factory);
    } else {
        root.chart_INDChart = factory(root.common_Palette);
    }
}(this, function (Palette) {
    function INDChart() {
    };
    INDChart.prototype._palette = Palette.ordinal("default");

    //  Data ---
    INDChart.prototype.testData = function () {
        this.columns(["Subject", "Year 1", "Year 2", "Year 3"]);
        this.data([
            ["Geography", 75, 68, 65],
            ["English", 45, 55, 52],
            ["Math", 98, 92, 90],
            ["Science", 66, 60, 66]
        ]);
        return this;
    };

    //  Events  ---
    INDChart.prototype.click = function (row, column) {
        console.log("Click:  " + JSON.stringify(row) + ", " + column);
    };

    return INDChart;
}));



(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define('chart/Line.js',["d3/d3", "./XYAxis", "./INDChart", "css!./Line"], factory);
    } else {
        root.chart_Line = factory(root.d3, root.chart_XYAxis, root.chart_INDChart);
    }
}(this, function (d3, XYAxis, INDChart) {
    function Line(target) {
        XYAxis.call(this);
        INDChart.call(this);
        this._class = "chart_Line";
    };
    Line.prototype = Object.create(XYAxis.prototype);
    Line.prototype.implements(INDChart.prototype);

    Line.prototype.publish("paletteID", "default", "set", "Palette ID", Line.prototype._palette.switch());

    Line.prototype.enter = function (domNode, element) {
        XYAxis.prototype.enter.apply(this, arguments);
        var context = this;
    };

    Line.prototype.updateChart = function (domNode, element, margin, width, height) {
        var context = this;

        this._palette = this._palette.switch(this._paletteID);
        var d3Line = d3.svg.line()
            .x(function (d) {
                switch (context._xScale) {
                    case "DATE":
                        return context.x(context.parseDate(d[0]));
                }
                return context.x(d[0]) + (context.x.rangeBand ? context.x.rangeBand() / 2 : 0);
            })
            .y(function (d) { return context.y(d[1]); })
        ;

        var line = this.svgData.selectAll(".dataLine")
            .data(this._columns.filter(function(d, i) {return i > 0;}))
        ;

        line.enter().append("path")
            .attr("class", "dataLine")
        ;
        line
            .style("stroke", function (d, i) {
                return context._palette(context._columns[i + 1]);
            })
            .append("title")
            .text(function(d) { return d; })
        ;
        line
            .datum(function (d, i) { return context._data.map(function (row, rowIdx) { return [row[0], row[i + 1]];}); })
            .attr("d", d3Line)
        ;

        line.exit().remove();
    };

    return Line;
}));


(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define('chart/MultiChart',["d3/d3", "../common/SVGWidget", "./INDChart", "../other/Persist", "require"], factory);
    } else {
        root.chart_MultiChart = factory(root.d3, root.common_SVGWidget, root.chart_INDChart, root.other_Persist, root.require);
    }
}(this, function (d3, SVGWidget, INDChart, Persist, require) {
    var _2dChartTypes = [
        { id: "BUBBLE", display: "Bubble", widgetClass: "chart_Bubble" },
        { id: "COLUMN", display: "Column", widgetClass: "chart_Column" },
        { id: "PIE", display: "Pie", widgetClass: "chart_Pie" },
        { id: "GOOGLE_PIE", display: "Pie (Google)", widgetClass: "google_Pie" },
        { id: "C3_PIE", display: "Pie (C3)", widgetClass: "c3_Pie" },
        { id: "C3_DONUT", display: "Donut (C3)", widgetClass: "c3_Donut" },
        { id: "WORD_CLOUD", display: "Word Cloud", widgetClass: "other_WordCloud" }
    ];
    var _multiChartTypes = [
        { id: "GOOGLE_BAR", display: "Bar (Google)", widgetClass: "google_Bar" },
        { id: "GOOGLE_COLUMN", display: "Column (Google)", widgetClass: "google_Column" },
        { id: "LINE", display: "Line", widgetClass: "chart_Line" },
        { id: "GOOGLE_LINE", display: "Line (Google)", widgetClass: "google_Line" },
        { id: "C3_LINE", display: "Line (C3)", widgetClass: "c3_Line" },
        { id: "C3_BAR", display: "Bar (C3)", widgetClass: "c3_Bar" },
        { id: "C3_COLUMN", display: "Column (C3)", widgetClass: "c3_Column" },
        { id: "C3_STEP", display: "Step (C3)", widgetClass: "c3_Step" },
        { id: "C3_AREA", display: "Area (C3)", widgetClass: "c3_Area" },
        { id: "C3_SCATTER", display: "Scatter (C3)", widgetClass: "c3_Scatter" }
    ];
    var _anyChartTypes = [
        { id: "TABLE", display: "Table", widgetClass: "other_Table" }
    ];
    var _allChartTypes = _2dChartTypes.concat(_multiChartTypes.concat(_anyChartTypes));

    function MultiChart() {
        SVGWidget.call(this);
        INDChart.call(this);
        this._class = "chart_MultiChart";

        this._chart = null;

        this._2dChartTypes = _2dChartTypes;
        this._multiChartTypes = _multiChartTypes;
        this._anyChartTypes = _anyChartTypes;
        this._allChartTypes = _allChartTypes;

        this._allCharts = {};
        this._allChartTypes.forEach(function (item) {
            var newItem = JSON.parse(JSON.stringify(item));
            newItem.widget = null;
            this._allCharts[item.id] = newItem;
            this._allCharts[item.display] = newItem;
            this._allCharts[item.widgetClass] = newItem;
        }, this);
        //  Backward compatability until we roll our own BAR  ---
        this._allCharts["BAR"] = this._allCharts["COLUMN"];
    };
    MultiChart.prototype = Object.create(SVGWidget.prototype);
    MultiChart.prototype.implements(INDChart.prototype);

    MultiChart.prototype.publish("chart_type", "BUBBLE", "set", "Chart Type", _allChartTypes.map(function (item) { return item.id; }));
    MultiChart.prototype.publish("chart", null, "widget", "Chart");

    MultiChart.prototype.columns = function (_) {
        var retVal = SVGWidget.prototype.columns.apply(this, arguments);
        if (arguments.length && this._chart) {
            this._chart.columns(_);
        }
        return retVal;
    };

    MultiChart.prototype.data = function (_) {
        var retVal = SVGWidget.prototype.data.apply(this, arguments);
        if (arguments.length && this._chart) {
            this._chart.data(_);
        }
        return retVal;
    };

    MultiChart.prototype.hasOverlay = function () {
        return this._chart && this._chart.hasOverlay();
    };

    MultiChart.prototype.visible = function (_) {
        if (!arguments.length) return this._chart.visible();
        if (this._chart) {
            this._chart.visible(_);
        }
        return this;
    };

    MultiChart.prototype.requireContent = function (chartType, callback) {
        var retVal = this._allCharts[chartType].widget;
        if (retVal) {
            callback(retVal);
            return;
        }

        var context = this;
        var path = "../" + this._allCharts[chartType].widgetClass.split("_").join("/");
        require([path], function (widgetClass) {
            retVal = new widgetClass();
            context._allCharts[chartType].widget = retVal;
            callback(retVal);
        });
    };

    MultiChart.prototype.switchChart = function (callback) {
        var oldContent = this._chart;
        var context = this;
        this.requireContent(this._chart_type, function (newContent) {
            if (newContent !== oldContent) {
                var size = context.size();
                context._chart = newContent
                    .columns(context._columns)
                    .data(context._data)
                    .size(size)
                ;
                newContent.click = function (row, column) {
                    context.click(row, column);
                }
                if (oldContent) {
                    oldContent
                        .data([])
                        .size({ width: 1, height: 1 })
                        .render()
                    ;
                }
            }
            if (callback) {
                callback(this);
            }
        });
    };

    MultiChart.prototype.update = function (domNode, element) {
        SVGWidget.prototype.update.apply(this, arguments);
        var content = element.selectAll(".multiChart").data(this._chart ? [this._chart] : [], function (d) { return d._id; });
        content.enter().append("g")
            .attr("class", "multiChart")
            .each(function (d) {
                d.target(this);
            })
        ;

        var size = this.size();
        content
            .each(function (d) {
                d
                    .size(size)
                    .render()
                ;
            })
        ;

        content.exit().transition()
            .each(function (d) { d.target(null); })
            .remove()
        ;
    };

    MultiChart.prototype.exit = function (domNode, element) {
        if (this._chart) {
            this._chart.target(null);
        }
        SVGWidget.prototype.exit.apply(this, arguments);
    };


    MultiChart.prototype.render = function (callback) {
        if (this._chart_type && (!this._chart || (this._chart._class !== this._allCharts[this._chart_type].widgetClass))) {
            var context = this;
            var args = arguments;
            this.switchChart(function () {
                SVGWidget.prototype.render.apply(context, args);
            });
            return this;
        }
        return SVGWidget.prototype.render.apply(this, arguments);
    }

    return MultiChart;
}));


(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define('chart/MultiChartSurface.js',["d3/d3", "../common/ResizeSurface", "./MultiChart", "./INDChart"], factory);
    } else {
        root.chart_MultiChartSurface = factory(root.d3, root.common_ResizeSurface, root.chart_MultiChart, root.chart_INDChart);
    }
}(this, function (d3, ResizeSurface, MultiChart, INDChart) {
    function MultiChartSurface() {
        ResizeSurface.call(this);
        INDChart.call(this);
        this.class = "chart_MultiChartSurface";

        this._title = "MultiChartSurface";
        this._content = new MultiChart();
        this._content.click = function (row, column) {
            context.click(row, column);
        }

        var context = this;
        this._menu.click = function (d) {
            context._content.chart_type(d).render();
        }
        this.mode("all");
    };
    MultiChartSurface.prototype = Object.create(ResizeSurface.prototype);
    MultiChartSurface.prototype.implements(INDChart.prototype);
    MultiChartSurface.prototype.testData = INDChart.prototype.testData;

    MultiChartSurface.prototype.publishProxy("chart_type", "_content");

    MultiChartSurface.prototype.columns = function (_) {
        if (!arguments.length) return this._content.columns();
        this._content.columns(_);
        return this;
    };

    MultiChartSurface.prototype.data = function (_) {
        if (!arguments.length) return this._content.data();
        this._content.data(_);
        return this;
    };

    MultiChartSurface.prototype.mode = function (_) {
        if (!arguments.length) return this._mode;
        this._mode = _;
        switch (this._mode) {
            case "2d":
                this.menu(this._content._2dChartTypes.concat(this._content._anyChartTypes).map(function (item) { return item.display; }).sort());
                break;
            case "multi":
                this.menu(this._content._multiChartTypes.concat(this._content._anyChartTypes).map(function (item) { return item.display; }).sort());
                break;
            case "all":
            default:
                this.menu(this._content._allChartTypes.map(function (item) { return item.display; }).sort());
        }
        return this;
    };

    return MultiChartSurface;
}));



(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define('chart/Pie.js',["d3/d3", "../common/SVGWidget", "./I2DChart", "../common/Text", "../common/FAChar", "css!./Pie"], factory);
    } else {
        root.chart_Pie = factory(root.d3, root.common_SVGWidget, root.chart_I2DChart, root.common_Text, root.common_FAChar);
    }
}(this, function (d3, SVGWidget, I2DChart, Text, FAChar) {
    function Pie(target) {
        SVGWidget.call(this);
        I2DChart.call(this);
        this._class = "chart_Pie";

        this._outerText = false;  //  Put label inside pie or outside (true/false)
        this._radius = 100;       // px
        this._innerRadius = 0;    // px

        this.labelWidgets = {};

        this.d3Pie = d3.layout.pie()
            .sort(function (a, b) {
                return a < b ? -1 : a > b ? 1 : 0;
            })
            .value(function (d) { return d[1]; })
        ;
        this.d3Arc = d3.svg.arc()
            .outerRadius(this._radius)
            .innerRadius(this._innerRadius)
        ;
    };
    Pie.prototype = Object.create(SVGWidget.prototype);
    Pie.prototype.implements(I2DChart.prototype);

    Pie.prototype.publish("paletteID", "default", "set", "Palette ID", Pie.prototype._palette.switch());

    Pie.prototype.size = function (_) {
        var retVal = SVGWidget.prototype.size.apply(this, arguments);
        if (arguments.length) {
            this.radius(Math.min(this._size.width, this._size.height) / 2);
        }
        return retVal;
    };

    Pie.prototype.radius = function (_) {
        if (!arguments.length) return this._radius;
        this.d3Arc.outerRadius(_);
        this._radius = _;
        return this;
    };

    Pie.prototype.innerRadius = function (_) {
        if (!arguments.length) return this._innerRadius;
        this.d3Arc.innerRadius(_);
        this._innerRadius = _;
        return this;
    };

    Pie.prototype.outerText = function (_) {
        if (!arguments.length) return this._outerText;
        this._outerText = _;
        return this;
    };

    Pie.prototype.intersection = function (pointA, pointB) {
        return this.intersectCircle(pointA, pointB);
    };

    Pie.prototype.update = function (domNode, element) {
        var context = this;

        this._palette = this._palette.switch(this._paletteID);
        var arc = element.selectAll(".arc").data(this.d3Pie(this._data), function (d) { return d.data[0]; });

        //  Enter  ---
        arc.enter().append("g")
            .attr("class", "arc")
            .attr("opacity", 0)
            .on("click", function (d) {
                context.click(context.rowToObj(d.data), context._columns[1]);
            })
            .each(function (d) {
                var element = d3.select(this);
                element.append("path")
                    .attr("d", context.d3Arc)
                    .append("title")
                ;
                if (d.data.__viz_faChar) {
                    context.labelWidgets[d.data[0]] = new FAChar()
                        .char(d.data.__viz_faChar)
                        .target(this)
                        .render()
                    ;
                } else {
                    context.labelWidgets[d.data[0]] = new Text()
                        .text(d.data[0])
                        .target(this)
                        .render()
                    ;
                }
            })
        ;

        //  Update  ---
        arc.transition()
            .attr("opacity", 1)
            .each(function (d) {
                var pos = { x: 0, y: 1 };
                if (context._outerText) {
                    var xFactor = Math.cos((d.startAngle + d.endAngle - Math.PI) / 2);
                    var yFactor = Math.sin((d.startAngle + d.endAngle - Math.PI) / 2);

                    var textBBox = context.labelWidgets[d.data[0]].getBBox();
                    var textOffset = Math.abs(xFactor) > Math.abs(yFactor) ? textBBox.width : textBBox.height;
                    pos.x = xFactor * (context._radius + textOffset);
                    pos.y = yFactor * (context._radius + textOffset);
                } else {
                    var centroid = context.d3Arc.centroid(d);
                    pos = { x: centroid[0], y: centroid[1] };
                }

                var element = d3.select(this);
                element.select("path").transition()
                    .attr("d", context.d3Arc)
                    .style("fill", function (d) { return context._palette(d.data[0]); })
                    .select("title")
                        .text(function (d) { return d.data[0] + " (" + d.data[1] + ")"; })
                ;
                context.labelWidgets[d.data[0]]
                    .pos(pos)
                    .render()
                    .element()
                        .classed("innerLabel", !context._outerText)
                        .classed("outerLabel", context._outerText)
                ;
            })
        ;

        //  Exit  ---
        arc.exit().transition()
            .style("opacity", 0)
            .remove()
        ;

        //  Label Lines  ---
        if (context._outerText) {
            var lines = element.selectAll("line").data(this.d3Pie(this._data), function (d) { return d.data[0]; });
            var r = this.radius();
            lines.enter().append("line")
              .attr("x1", 0)
              .attr("x2", 0)
              .attr("y1", -this._radius - 3)
              .attr("y2", -this._radius - 8)
              .attr("stroke", "gray")
              .attr("transform", function (d) {
                  return "rotate(" + (d.startAngle + d.endAngle) / 2 * (180 / Math.PI) + ")";
              });
            lines.transition()
              .attr("transform", function (d) {
                  return "rotate(" + (d.startAngle + d.endAngle) / 2 * (180 / Math.PI) + ")";
              });
            lines.exit().remove();
        }
    };

    return Pie;
}));


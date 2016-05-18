﻿"use strict";
(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define([], factory);
    } else {
        root.test_chartFactory = factory();
    }
}(this, function () {
    var chartFactory = {
        Column: {
            simple: function (callback) {
                require(["test/DataFactory", "src/chart/Column"], function (DataFactory, Column) {
                    callback(new Column()
                        .columns(DataFactory.ND.subjects.columns)
                        .data(DataFactory.ND.subjects.data)
                    );
                });
            },
            "long-label": function (callback) {
                require(["test/DataFactory", "src/chart/Column"], function (DataFactory, Column) {
                    callback(new Column()                        
                        .columns(DataFactory.ND.subjects.columns)
                        .data([
                            ["Geography-Geography-Geography-Geography-Geography", 75, 68, 65],
                            ["English", 45, 55, 52],
                            ["Math", 98, 92, 90],
                            ["Science", 66, 60, 72]
                        ])

                        .xAxisOverlapMode("rotate")
                        .xAxisLabelRotation(45)
                    );
                });
            },
            bar: function (callback) {
                chartFactory.Column.simple(function (widget) {
                    widget.orientation("vertical");
                    callback(widget);
                });
            },
            ordinalRange: function (callback) {
                require(["test/DataFactory", "src/chart/Column"], function (DataFactory, Column) {
                    callback(new Column()
                        .columns(DataFactory.ordinalRange.default.columns)
                        .data(DataFactory.ordinalRange.default.data)
                        
                        .yAxisType("linear")
                        .xAxisType("ordinal")
                    );
                });
            },
            linear: function (callback) {
                require(["test/DataFactory", "src/chart/Column"], function (DataFactory, Column) {
                    callback(new Column()
                        .columns(DataFactory.linear.default.columns)
                        .data(DataFactory.linear.default.data)
                        
                        .xAxisType("linear")
                        .yAxisType("linear")
                    );
                });
            },
            timeX: function (callback) {
                require(["test/DataFactory", "src/chart/Column"], function (DataFactory, Column) {
                    callback(new Column()
                        .columns(DataFactory.timeX.default.columns)
                        .data(DataFactory.timeX.default.data)
                        
                        .xAxisType("time")
                        .xAxisTypeTimePattern("%Y-%m-%dT%H:%M:%S")
                        .yAxisType("linear")
                    );
                });
            },
            timeY: function (callback) {
                require(["test/DataFactory", "src/chart/Column"], function (DataFactory, Column) {
                    callback(new Column()
                        .columns(DataFactory.timeY.default.columns)
                        .data(DataFactory.timeY.default.data)
                        
                        .xAxisType("ordinal")
                        .yAxisType("time")
                        .yAxisTypeTimePattern("%Y-%m-%d")
                    );
                });
            },
        },
        Bar: {
            simple: function (callback) {
                require(["test/DataFactory", "src/chart/Bar"], function (DataFactory, Bar) {
                    callback(new Bar()
                        .columns(DataFactory.ND.subjects.columns)
                        .data(DataFactory.ND.subjects.data)
                    );
                });
            }
        },
        Gantt: {
            simple: function (callback) {
                require(["test/DataFactory", "src/chart/Gantt"], function (DataFactory, Gantt) {
                    callback(new Gantt()
                        .yAxisTypeTimePattern("%Y-%m-%d")
                        .columns(["Project", "Date Range"])
                        .data([
                            ["Docs", ["2012-09-09", "2012-10-09"]],
                            ["Coding", ["2011-08-09", "2012-09-09"]],
                            ["Specs", ["2010-07-09", "2011-08-09"]]
                        ])
                    );
                });
            }
        },
        Bubble: {
            simple: function (callback) {
                require(["test/DataFactory", "src/chart/Bubble"], function (DataFactory, Bubble) {
                    callback(new Bubble()
                        .columns(DataFactory.TwoD.subjects.columns)
                        .data(DataFactory.TwoD.subjects.data)
                    );
                });
            }
        },
        Scatter: {
            simple: function (callback) {
                require(["test/DataFactory", "src/chart/Scatter"], function (DataFactory, Scatter) {
                    callback(new Scatter()
                        .columns(DataFactory.ND.subjects.columns)
                        .data(DataFactory.ND.subjects.data)
                    );
                });
            }
        },
        Line: {
            simple: function (callback) {
                require(["test/DataFactory", "src/chart/Line"], function (DataFactory, Line) {
                    callback(new Line()
                        .columns(DataFactory.ND.subjects.columns)
                        .data(DataFactory.ND.subjects.data)
                    );
                });
            },
            timeX: function (callback) {
                require(["test/DataFactory", "src/chart/Line"], function (DataFactory, Line) {
                    callback(new Line()
                        .columns(DataFactory.timeX.default.columns)
                        .data(DataFactory.timeX.default.data)
                        
                        .xAxisType("time")
                        .xAxisTypeTimePattern("%Y-%m-%dT%H:%M:%S")
                        .yAxisType("linear")
                    );
                });
            },
            cardinal_interpolation: function (callback) {
                require(["test/DataFactory", "src/chart/Line"], function (DataFactory, Line) {
                    callback(new Line()
                        .columns(DataFactory.ND.subjects.columns)
                        .data(DataFactory.ND.subjects.data)
                        .interpolate("cardinal")
                    );
                });
            }
        },
        Area: {
            simple: function (callback) {
                require(["test/DataFactory", "src/chart/Area"], function (DataFactory, Area) {
                    callback(new Area()
                        .columns(DataFactory.ND.subjects.columns)
                        .data(DataFactory.ND.subjects.data)
                    );
                });
            }
        },
        Pie: {
            simple: function (callback) {
                require(["test/DataFactory", "src/chart/Pie"], function (DataFactory, Pie) {
                    callback(new Pie()
                        .columns(DataFactory.TwoD.subjects.columns)
                        .data(DataFactory.TwoD.subjects.data)
                    );
                });
            }
        },
        Step: {
            simple: function (callback) {
                require(["test/DataFactory", "src/chart/Step"], function (DataFactory, Step) {
                    callback(new Step()
                        .columns(DataFactory.ND.subjects.columns)
                        .data(DataFactory.ND.subjects.data)
                    );
                });
            }
        },
        Summary: {
            simple: function (callback) {
                require(["test/DataFactory", "src/chart/Summary"], function (DataFactory, Summary) {
                    callback(new Summary()
                        .columns(DataFactory.OneD.subjects.columns)
                        .data(DataFactory.OneD.subjects.data)
                    );
                });
            }
        },
        MultiChart: {
            simple: function (callback) {
                require(["test/DataFactory", "src/chart/MultiChart"], function (DataFactory, MultiChart) {
                    callback(new MultiChart()
                        .columns(DataFactory.ND.subjects.columns)
                        .data(DataFactory.ND.subjects.data)
                    );
                });
            }
        },
        MultiChartSurface: {
            simple: function (callback) {
                require(["test/DataFactory", "src/chart/MultiChartSurface"], function (DataFactory, MultiChartSurface) {
                    callback(new MultiChartSurface()
                        .columns(DataFactory.ND.subjects.columns)
                        .data(DataFactory.ND.subjects.data)
                    );
                });
            }
        },
        BulletChart: {
        	simple: function (callback) {
                require(["test/DataFactory", "src/chart/BulletChart"], function (DataFactory, BulletChart) {
                    callback(new BulletChart()
                        .columns(["Revenue", "Profit", "Order Size", "New Customers", "Satisfaction"])
                        .data([
							  {"title":"Revenue","subtitle":"US$, in thousands","ranges":[150,225,300],"measures":[220,270],"markers":[250]},
							  {"title":"Profit","subtitle":"%","ranges":[20,25,30],"measures":[21,23],"markers":[26]},
							  {"title":"Order Size","subtitle":"US$, average","ranges":[350,500,600],"measures":[100,320],"markers":[550]},
							  {"title":"New Customers","subtitle":"count","ranges":[1400,2000,2500],"measures":[1000,1650],"markers":[2100]},
							  {"title":"Satisfaction","subtitle":"out of 5","ranges":[3.5,4.25,5],"measures":[3.2,4.7],"markers":[4.4]}
                		])
                    );
                });
            }
        }
    };

    return chartFactory;
}));

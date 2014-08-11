﻿(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define(["d3/d3", "../common/Surface", "./I2DChart", "./Pie", "./Bubble", "../common/Palette"], factory);
    } else {
        root.MultiChartSurface = factory(root.d3, root.Surface, root.I2DChart, root.Pie, root.Bubble, root.Palette);
    }
}(this, function (d3, Surface, I2DChart, Pie, Bubble, Palette, usStates) {
    function MultiChartSurface() {
        Surface.call(this);
        I2DChart.call(this);

        this._title = "MultiChartSurface";

        this._menu
            .data(["Pie", "Bubble"])
        ;
        var context = this;
        this._pie = new Pie();
        this._pie.click = function (d) {
            context.click(d);
        }
        this._bubble = new Bubble();
        this._bubble.d3Color = this._pie.d3Color;
        this._bubble.click = function (d) {
            context.click(d);
        }
        this._content = this._pie;
        this._menu.click = function (d) {
            context.activate(d);
        }
    };
    MultiChartSurface.prototype = Object.create(Surface.prototype);
    MultiChartSurface.prototype.implements(I2DChart.prototype);

    MultiChartSurface.prototype.activate = function (chart) {
        var oldContent = this._content;
        var newContent = null;
        var size = this._container.getBBox();
        switch (chart) {
            case "Pie":
                newContent = this._pie;
                break;
            case "Bubble":
                newContent = this._bubble;
                break;
        }
        if (newContent === oldContent) {
            return;
        }
        this.content(newContent
            .data(this._data)
//            .size(size)
//            .render()
        );
        if (oldContent) {
            oldContent
                .data([])
//                .render()
            ;
        }
        this.render();
    };


    MultiChartSurface.prototype.data = function (_) {
        var retVal = Surface.prototype.data.call(this, _);
        if (arguments.length && this._content) {
            this._content.data(_);
        }
        return retVal;
    };

    return MultiChartSurface;
}));

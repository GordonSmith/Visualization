"use strict";
(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define(["d3", "./CommonND"], factory);
    } else {
        root.google_Area = factory(root.d3, root.google_CommonND);
    }
}(this, function (d3, CommonND) {

    function Area() {
        CommonND.call(this);

        this._chartType = "AreaChart";
    };
    Area.prototype = Object.create(CommonND.prototype);
    Area.prototype._class += " google_Area";

    /**
     * Publish Params Common To Other Libraries
     */
    Area.prototype.publish("isStacked", false, "boolean", "Stacks the elements in a series",null,{tags:['Advanced']});
    Area.prototype.publish("fillOpacity", null, "number", "Opacity of Area under line",null,{tags:['Intermediate']});
    
    Area.prototype.publish("axisFontSize", null, "number", "Vertical axis text style (Font Size)",null,{tags:['Basic']});
    Area.prototype.publish("axisFontFamily", null, "string", "Vertical axis text style (Font Name)",null,{tags:['Basic']});
    
    Area.prototype.publish("xAxisFontColor", null, "html-color", "Horizontal axis text style (Color)",null,{tags:['Basic']});
    Area.prototype.publish("yAxisFontColor", null, "html-color", "Vertical axis text style (Color)",null,{tags:['Basic']});
    
    Area.prototype.publish("xAxisBaselineColor", "#000000", "html-color", "Specifies the color of the baseline for the horizontal axis",null,{tags:['Intermediate']});
    Area.prototype.publish("yAxisBaselineColor", "#000000", "html-color", "Specifies the color of the baseline for the vertical axis",null,{tags:['Intermediate']});
    
    Area.prototype.publish("xAxisTitle", "", "string", "Specifies a title for the horizontal axis",null,{tags:['Basic']});
    Area.prototype.publish("yAxisTitle", "", "string", "Specifies a title for the vertical axis",null,{tags:['Basic']});
    
    Area.prototype.publish("xAxisTitleFontColor", null, "html-color", "Horizontal axis title text style (Color)",null,{tags:['Intermediate']});
    Area.prototype.publish("yAxisTitleFontColor", null, "html-color", "Vertical axis title text style (Color)",null,{tags:['Intermediate']});
    
    Area.prototype.publish("xAxisTitleFontSize", null, "number", "Horizontal axis titletext style (Font Size)",null,{tags:['Intermediate']});
    Area.prototype.publish("yAxisTitleFontSize", null, "number", "Vertical axis titletext style (Font Size)",null,{tags:['Intermediate']});
    
    Area.prototype.publish("xAxisTitleFontFamily", null, "string", "Horizontal axis title text style (Font Name)",null,{tags:['Intermediate']});
    Area.prototype.publish("yAxisTitleFontFamily", null, "string", "Vertical axis title text style (Font Name)",null,{tags:['Intermediate']});
    
    Area.prototype.publish("xAxisLabelRotation", 0, "number", "The angle of the horizontal axis text",null,{tags:['Intermediate']});
    
    /**
     * Publish Params Unique To This Widget
     */   
    Area.prototype.publish("dataOpacity", 1.0, "number", "Transparency of Data Points",null,{tags:['Advanced']}); //TODO: this probably isnt needed?
    //Area.prototype.publish("smoothLines", true, "boolean", "Causes chart data lines to draw smoothly",null,{tags:['Basic']}); //TODO:Add this (from Line.js)
    Area.prototype.publish("selectionMode", "single", "set", "Select Multiple Data Points", ["single","multiple"],{tags:['Advanced']});

    Area.prototype.publish("xAxisBaseline", null, "number", "The baseline for the horizontal axis",null,{tags:['Intermediate']});
    Area.prototype.publish("yAxisBaseline", null, "number", "The baseline for the horizontal axis",null,{tags:['Intermediate']});
    
    Area.prototype.publish("xAxisInversed", false, "boolean", "The direction in which the values along the horizontal axis grow.",null,{tags:['Advanced']});
    Area.prototype.publish("yAxisInversed", false, "boolean", "The direction in which the values along the vertical axis grow.",null,{tags:['Advanced']});
    
    Area.prototype.publish("xAxisFormat", "", "string", "A format string for numeric axis labels", ["","decimal","scientific","currency","percent","short","long"],{tags:['Intermediate']});
    Area.prototype.publish("yAxisFormat", "", "string", "A format string for numeric axis labels", ["","decimal","scientific","currency","percent","short","long"],{tags:['Intermediate']});
    
    Area.prototype.publish("xAxisGridlinesCount", 5, "number", "The number of horizontal gridlines between two regular gridlines",null,{tags:['Intermediate']});
    Area.prototype.publish("yAxisGridlinesCount", 5, "number", "The number of vertical gridlines between two regular gridlines",null,{tags:['Intermediate']});
    
    Area.prototype.publish("xAxisGridlinesColor", "#CCC", "html-color", "The color of the horizontal gridlines inside the chart area",null,{tags:['Basic']});
    Area.prototype.publish("yAxisGridlinesColor", "#CCC", "html-color", "The color of the vertical gridlines inside the chart area",null,{tags:['Basic']});

    Area.prototype.publish("xAxisMinorGridlinesCount", 0, "number", "The number of horizontal minor gridlines between two regular gridlines",null,{tags:['Intermediate']});
    Area.prototype.publish("yAxisMinorGridlinesCount", 0, "number", "The number of vertical minor gridlines between two regular gridlines",null,{tags:['Intermediate']});
    
    Area.prototype.publish("xAxisMinorGridlinesColor", "#FFFFFF", "html-color", "The color of the horizontal minor gridlines inside the chart area",null,{tags:['Intermediate']});
    Area.prototype.publish("yAxisMinorGridlinesColor", "#FFFFFF", "html-color", "The color of the vertical minor gridlines inside the chart area",null,{tags:['Intermediate']});
    
    Area.prototype.publish("xAxisLogScale", false, "boolean", "Makes horizontal axis a log scale",null,{tags:['Advanced']});
    Area.prototype.publish("yAxisLogScale", false, "boolean", "Makes vertical axis a log scale",null,{tags:['Advanced']});
    
    Area.prototype.publish("xAxisTextPosition", "out", "set", "Position of the horizontal axis text, relative to the chart area", ["out","in","none"],{tags:['Advanced']});
    Area.prototype.publish("yAxisTextPosition", "out", "set", "Position of the vertical axis text, relative to the chart area", ["out","in","none"],{tags:['Advanced']});
    
    Area.prototype.publish("xAxisTicks", [], "array", "Replaces the automatically generated X-axis ticks with the specified array",null,{tags:['Private']});
    Area.prototype.publish("yAxisTicks", [], "array", "Replaces the automatically generated Y-axis ticks with the specified array",null,{tags:['Private']});

    Area.prototype.publish("xAxisMaxValue", null, "number", "Moves the max value of the horizontal axis to the specified value",null,{tags:['Advanced']});
    Area.prototype.publish("yAxisMaxValue", null, "number", "Moves the max value of the vertical axis to the specified value",null,{tags:['Advanced']});

    Area.prototype.publish("xAxisMinValue", null, "number", "Moves the min value of the horizontal axis to the specified value",null,{tags:['Advanced']});
    Area.prototype.publish("yAxisMinValue", null, "number", "Moves the min value of the vertical axis to the specified value",null,{tags:['Advanced']});
    
    Area.prototype.publish("xAxisViewWindowMode", "pretty", "set", "Specifies how to scale the horizontal axis to render the values within the chart area", ["pretty","maximized","explicit"],{tags:['Advanced']});
    Area.prototype.publish("yAxisViewWindowMode", "pretty", "set", "Specifies how to scale the vertical axis to render the values within the chart area", ["pretty","maximized","explicit"],{tags:['Advanced']});
    
    Area.prototype.publish("xAxisViewWindowMax", null, "number", "The maximum horizontal data value to render",null,{tags:['Advanced']});
    Area.prototype.publish("yAxisViewWindowMax", null, "number", "The maximum vertical data value to render",null,{tags:['Advanced']});
    
    Area.prototype.publish("xAxisViewWindowMin", null, "number", "The minimum horizontal data value to render",null,{tags:['Advanced']});
    Area.prototype.publish("yAxisViewWindowMin", null, "number", "The minimum vertical data value to render",null,{tags:['Advanced']});
    
    //Area.prototype.publish("xAxisAllowContainerBoundaryTextCutoff", false, "boolean", "Hide outermost labels rather than allow them to be cropped by the chart container.",null,{tags:['Advanced']});
    
    Area.prototype.publish("xAxisMaxAlternation", 2, "number", "Maximum number of levels of horizontal axis text",null,{tags:['Advanced']});
    Area.prototype.publish("xAxisMaxTextLines", null, "number", "Maximum number of lines allowed for the text labels",null,{tags:['Advanced']});
    Area.prototype.publish("xAxisMinTextSpacing", null, "number", "Minimum horizontal spacing, in pixels, allowed between two adjacent text labels",null,{tags:['Advanced']});

    Area.prototype.getChartOptions = function () {
        var retVal = CommonND.prototype.getChartOptions.apply(this, arguments);
        
        retVal.selectionMode = this.selectionMode();
        retVal.dataOpacity = this.dataOpacity();
        
        retVal.isStacked = this.isStacked();
        retVal.areaOpacity = this.fillOpacity();
        
        retVal.hAxis = {};
        retVal.vAxis = {};
        
        retVal.hAxis.baseline = this.xAxisBaseline();
        retVal.hAxis.baselineColor = this.xAxisBaselineColor();
        retVal.hAxis.direction = this.xAxisInversed() ? -1 : 1;
        retVal.hAxis.gridlines = {
            count: this.xAxisGridlinesCount(),
            color: this.xAxisGridlinesColor()
        }
        retVal.hAxis.minorGridlines = {
            count: this.xAxisMinorGridlinesCount(),
            color: this.xAxisMinorGridlinesColor()
        }        
        retVal.hAxis.logScale = this.xAxisLogScale();
        retVal.hAxis.textPosition = this.xAxisTextPosition();
        retVal.hAxis.title = this.xAxisTitle();
        retVal.hAxis.minValue = this.xAxisMinValue();
        retVal.hAxis.maxValue = this.xAxisMaxValue();
        
        //retVal.hAxis.allowContainerBoundaryTextCufoff = this.xAxisAllowContainerBoundaryTextCutoff();
        retVal.hAxis.slantedText = this.xAxisLabelRotation() !== 0;
        retVal.hAxis.slantedTextAngle = this.xAxisLabelRotation();
        retVal.hAxis.maxAlternation = this.xAxisMaxAlternation();
        retVal.hAxis.maxTextLines = this.xAxisMaxTextLines();
        retVal.hAxis.minTextSpacing = this.xAxisMinTextSpacing();
        
        retVal.hAxis.format = this.xAxisFormat();
        retVal.hAxis.textStyle = {
            color: this.xAxisFontColor(),
            fontName: this.axisFontFamily() ? this.axisFontFamily() : this.fontFamily(),
            fontSize: this.axisFontSize() ? this.axisFontSize() : this.fontSize()
        }
        if (this.xAxisTicks().length > 0) {
            retVal.hAxis.ticks = this.xAxisTicks();
        }
        retVal.hAxis.titleTextStyle = {
            color: this.xAxisTitleFontColor(),
            fontName: this.xAxisTitleFontFamily(),
            fontSize: this.xAxisTitleFontSize()
        }
        retVal.hAxis.viewWindowMode = this.xAxisViewWindowMode();
        retVal.hAxis.viewWindow = {
            min: this.xAxisViewWindowMin(),
            max: this.xAxisViewWindowMax()
        }
        
        //vAxis
        retVal.vAxis.baseline = this.yAxisBaseline();
        retVal.vAxis.baselineColor = this.yAxisBaselineColor();
        retVal.vAxis.direction = this.yAxisInversed() ? -1 : 1;
        retVal.vAxis.gridlines = {
            count: this.yAxisGridlinesCount(),
            color: this.yAxisGridlinesColor()
        }
        retVal.vAxis.minorGridlines = {
            count: this.yAxisMinorGridlinesCount(),
            color: this.yAxisMinorGridlinesColor()
        }        
        retVal.vAxis.logScale = this.yAxisLogScale();
        retVal.vAxis.textPosition = this.yAxisTextPosition();
        retVal.vAxis.title = this.yAxisTitle();
        retVal.vAxis.minValue = this.yAxisMinValue();
        retVal.vAxis.maxValue = this.yAxisMaxValue();
        
        retVal.vAxis.format = this.yAxisFormat();
        retVal.vAxis.textStyle = {
            color: this.yAxisFontColor(),
            fontName: this.axisFontFamily() ? this.axisFontFamily() : this.fontFamily(),
            fontSize: this.axisFontSize() ? this.axisFontSize() : this.fontSize()
        }
        if (this.yAxisTicks().length > 0) {
            retVal.vAxis.ticks = this.yAxisTicks();
        }
        retVal.vAxis.titleTextStyle = {
            color: this.yAxisTitleFontColor(),
            fontName: this.yAxisTitleFontFamily(),
            fontSize: this.yAxisTitleFontSize()
        }
        retVal.vAxis.viewWindowMode = this.yAxisViewWindowMode();
        retVal.vAxis.viewWindow = {
            min: this.yAxisViewWindowMin(),
            max: this.yAxisViewWindowMax()
        }        
        return retVal;
    };

    Area.prototype.enter = function (domNode, element) {
        CommonND.prototype.enter.apply(this, arguments);
    };

    Area.prototype.update = function (domNode, element) {
        CommonND.prototype.update.apply(this, arguments);
    };
    
    return Area;
}));

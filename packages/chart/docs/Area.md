# Area

<!--meta

-->

Area, [Line](./Line.md), [Step](./Step.md) and [Scatter](./Scatter.md) serve a similar purpose. They display continuous data along a categorical or continuous axis.

```sample-code
import { Area } from "@hpcc-js/chart";

new Area()
    .target("target")
    .columns(["Category", "Value"])
    .data([
        ["A", 34],
        ["B", 55],
        ["C", 89],
        ["D", 144]
    ])
    .render()
    ;
```

Area supports n-number of numeric values per data row. A series is created for each column as needed. 

```sample-code
import { Area } from "@hpcc-js/chart";

new Area()
    .target("target")
    .columns(["Category", "Value 1", "Value 2", "Value 3"])
    .data([
        ["A", 34, 90, 82],
        ["B", 55, 50, 65],
        ["C", 89, 75, 43],
        ["D", 144, 66, 56]
    ])
    .render()
    ;
```

_pointShape_ can be used to specify the shape of each data point (see the property list below for potential values).

_pointSize_ can be used to set the size of each data point's shape.

_showValue_ specifies whether or not to display the value above each data point.

_yAxisDomainPadding_ can be used to reserve a percentage of the top and bottom edges for white space.

```sample-code
import { Area } from "@hpcc-js/chart";

new Area()
    .target("target")
    .columns(["Category", "Value", "Value 2"])
    .data([
        ["A", 34, 350],
        ["B", 55, 380],
        ["C", 89, 390],
        ["D", 98, 410]
    ])
    .pointShape("circle")
    .pointSize(2)
    .showValue(true)
    .yAxisDomainPadding(10)
    .render()
    ;
```

_interpolate_ can be used to specify which line interpolation mode is used to draw the connecting line between data points (see the property list below for potential values).

_pointDarken_ can be set to 'false' to disable the slight darkening effect applied to each data point.

_showValue_ along with _valueBaseline("central")_ places the values at the center of each data point.

_xAxisDomainPadding_ can be used to reserve a percentage of the left and right edges for white space.

```sample-code
import { Area } from "@hpcc-js/chart";

new Area()
    .target("target")
    .columns(["Value 1", "Value 2"])
    .data([
        [144, 90],
        [89, 50],
        [55, 75],
        [34, 66]
    ])
    .paletteID("FlatUI_German")
    .xAxisType("linear")
    .pointShape("rectangle")
    .pointSize(20)
    .pointDarken(false)
    .showValue(true)
    .valueBaseline("central")
    .xAxisDomainPadding(5)
    .render()
    ;
```

For documentation on axis-specific properties, like those used in the below example, take a look at the [Axis Documentation](./XYAxis.md).

```sample-code
import { Area } from "@hpcc-js/chart";

new Area()
    .target("target")
    .columns(["Value 1", "Value 2"])
    .data([
        [144, 90],
        [89, 50],
        [55, 75],
        [34, 66]
    ])
    .xAxisType("linear")
    .xAxisTitle("X-Axis Title")
    .yAxisTitle("Y-Axis Title")
    .xAxisTickCount(30)
    .xAxisOverlapMode("rotate")
    .xAxisLabelRotation(90)
    .pointShape("circle")
    .render()
    ;
```

## API

<!--meta:Area.target

-->

## Published Properties
```@hpcc-js/chart:Area
```

# Bar

<!--meta

-->

Bar and [Column](./Column) are effectively the same class, but have one different default value - their _orientation_. They support all of the same properties.

<ClientOnly>
  <hpcc-vitepress style="width:100%;height:600px">
    <div id="placeholder" style="height:400px">
    </div>
    <script type="module">
      import { Bar } from "@hpcc-js/chart";

      new Bar()
          .target("placeholder")
          .columns(['Guideline', 'Error Occurrences', 'Warning Occurrences']) 
          .data([
              [
                  "perceivable 1.1.1",
                  1,
                  76
              ],
              [
                  "perceivable 1.3.1b",
                  206,
                  6334
              ],
              [
                  "perceivable 1.3.1a",
                  0,
                  41
              ],
              [
                  "perceivable 1.4.10",
                  0,
                  36
              ],
              [
                  "operable 2.1.1",
                  0,
                  2819
              ],
              [
                  "operable 2.4.1",
                  31,
                  0
              ],
              [
                  "operable 2.4.2",
                  5,
                  0
              ],
              [
                  "operable 2.5.3",
                  0,
                  916
              ],
              [
                  "understandable 3.1.1",
                  5,
                  0
              ],
              [
                  "understandable 3.2.2",
                  43,
                  0
              ],
              [
                  "robust 4.1.1",
                  166,
                  0
              ],
              [
                  "robust 4.1.2",
                  579,
                  3104
              ]
            ])
          .orientation('vertical')
          .showValue(true)
          .valueCentered(true)
          .yAxisStacked(true)
          .yAxisType('pow')
          .yAxisTypePowExponent(0.5)
          .xAxisType('ordinal')
          .xAxisTitle('')
          .render()
          ;
    </script>
  </hpcc-vitepress>
</ClientOnly>

Two or more series are commonly compared with a bar chart.

<ClientOnly>
  <hpcc-vitepress style="width:100%;height:600px">
    <div id="placeholder" style="height:400px">
    </div>
    <script type="module">
      import { Bar } from "@hpcc-js/chart";

      new Bar()
          .target("placeholder")
          .columns(["Category", "Value 1", "Value 2"])
          .data([
              ["A", 34, 90],
              ["B", 55, 50],
              ["C", 89, 75],
              ["D", 144, 66]
          ])
          .xAxisOrdinalPaddingInner(0.38)
          .xAxisOrdinalPaddingOuter(0.62)
          .xAxisFocus(true)
          .render()
          ;
    </script>
  </hpcc-vitepress>
</ClientOnly>

A bar chart supports n-number of numeric values per data row. A series is created for each column as needed.  In the below example the series' are stacked together using the _yAxisStacked_ property.

<ClientOnly>
  <hpcc-vitepress style="width:100%;height:600px">
    <div id="placeholder" style="height:400px">
    </div>
    <script type="module">
      import { Bar } from "@hpcc-js/chart";

      new Bar()
          .target("placeholder")
          .columns(["Category", "Value 1", "Value 2", "Value 3"])
          .data([
              ["A", 34, 90, 82],
              ["B", 55, 50, 65],
              ["C", 89, 75, 43],
              ["D", 144, 66, 56]
          ])
          .showValue(true)
          .valueCentered(true)
          .yAxisStacked(true)
          .render()
          ;
    </script>
  </hpcc-vitepress>
</ClientOnly>


## API

## Published Properties
```@hpcc-js/chart:Bar
```
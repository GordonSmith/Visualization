# @hpcc-js/observablehq-compiler

_An (unoffical) ObservableHQ Compiler and interpreter for the [Observable HQ](https://observablehq.com) runtime._

* [Installing](#installing)
* [Observable](src/observable)

## Installing

For use with Webpack, Rollup, or other Node-based bundlers, @hpcc-js/observablehq-compiler is typically installed via a package manager such as Yarn or npm. (@hpcc-js/observablehq-compiler is distributed primarily as an ES module.)

```bash
npm install --save @hpcc-js/observablehq-compiler
```

@hpcc-js/observablehq-compiler can then be imported as a namespace:

```js
import { Observable } from "@hpcc-js/observablehq-compiler";
```

In vanilla HTML, @hpcc-js/observablehq-compiler can be imported as an ES module, say from Skypack:

```html
<script type="module">

import { Observable } from "https://cdn.skypack.dev/@hpcc-js/observablehq-compiler";

```

@hpcc-js/observablehq-compiler is also available as a UMD bundle for legacy browsers.

```html
<!doctype html>
<html>

<head>
    <meta charset="utf-8">
    <title>@hpcc-js/observablehq-compiler</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@hpcc-js/common/font-awesome/css/font-awesome.min.css">
    <link rel="stylesheet" href="./index.css">
    <script src="https://cdn.jsdelivr.net/npm/@hpcc-js/observablehq-compiler/dist/index.full.js" type="text/javascript" charset="utf-8"></script>
    <script>
        var omdMod = window["@hpcc-js/observablehq-compiler"]
    </script>
</head>

<body onresize="doResize()">
    <div id="placeholder">
    </div>
    <script>
        var app = new omdMod.Observable()
            .target("placeholder")
            .showValues(true)
            .mode("omd")
            .text("" +
"# ${hw} ${tick}                    \n" +
"                                   \n" +
"```                                \n" +
"hw = 'Hello' + 'World';            \n" +
"tick = {                           \n" +
"  let i = 0;                       \n" +
"  while (true) {                   \n" +
"    yield ++i;                     \n" +
"  }                                \n" +
"}                                  \n" +
"```                                \n")
            ;

        doResize();

        function doResize() {
            if (app) {
                app
                    .resize()
                    .lazyRender()
                    ;
            }
        }
    </script>
</body>

</html>
```

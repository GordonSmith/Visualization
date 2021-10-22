//  IE11 Polyfills:
import "core-js";
import "promise-polyfill/dist/polyfill.min.js";

import { Dashboard } from "./dashboard";
// import { fetchData } from "./data";

const app = new Dashboard("placeholder");

window.addEventListener("resize", () => {
    app
        .resize()
        .lazyRender()
        ;
});

// fetchData().then(data => app.loadData(data));

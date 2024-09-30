import { browserTpl, nodeTpl } from "@hpcc-js/esbuild-plugins";

//  config  ---
browserTpl("src/index.ts", "dist/index");

import { createHpccViteConfig } from "@hpcc-js/esbuild-plugins";
import pkg from "./package.json" with { type: "json" };
import type { Plugin } from "vite";

// Codemirror v5 uses the UMD pattern which includes AMD define() branches.
// When webpack processes our bundle, its AMDPlugin activates on the
// `typeof define === 'function' && define.amd` guard and tries to resolve
// the AMD dependency paths (e.g. "../../lib/codemirror") relative to dist/,
// where they don't exist.  Stripping the AMD branch before bundling prevents
// those relative paths from appearing in the output at all.
const stripCodemirrorAmd: Plugin = {
    name: "strip-codemirror-amd",
    enforce: "pre",
    transform(code, id) {
        if (id.includes("/codemirror/") && id.endsWith(".js")) {
            const transformed = code.replace(
                /\s*else\s+if\s*\(typeof define\s*===?\s*["']function["']\s*&&\s*define\.amd\)[^\n]*\n[^\n]+\n/g,
                "\n"
            );
            if (transformed !== code) {
                return { code: transformed, map: null };
            }
        }
    }
};

export default createHpccViteConfig(pkg, {
    plugins: [stripCodemirrorAmd]
});

import { createHpccViteConfig } from "./src/vite-utils";
import pkg from "./package.json" with { type: "json" };

export default createHpccViteConfig(pkg);
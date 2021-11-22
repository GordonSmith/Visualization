import { Dashboard } from "./dashboard";

const app = new Dashboard("placeholder").lazyRender();

window.addEventListener("resize", () => {
    app
        .resize()
        .lazyRender()
        ;
});

import { SVGWidget } from "./SVGWidget";
import { Text } from "./Text";

import "../src/FAChar.css";

export class FAChar extends SVGWidget {

    protected _text;

    constructor() {
        super();

        this._text = new Text()
            .fontFamily("FontAwesome")
            ;
    }

    enter(domNode, element) {
        super.enter(domNode, element);
        this._text
            .target(domNode)
            ;
        element
            .on("click", () => {
                this.click();
            })
            .on("dblclick", () => {
                this.dblclick();
            })
            ;
    }

    update(domNode, element) {
        super.update(domNode, element);
        this._text
            .text(this.char())
            .scale((this.fontSize() || 14) / 14) //  Scale rather than fontSize to prevent Chrome glitch  ---
            .render()
            ;
    }

    exit(domNode, element) {
        this._text
            .target(null)
            ;

        super.exit(domNode, element);
    }

    click() {
        console.log("Click:", this);
    }

    dblclick() {
        console.log("Double click:", this);
    }

    char: { (): string; (_: string): FAChar; };
    fontSize: { (): number; (_: number): FAChar; };
    text_colorFill: { (): string; (_: string): FAChar; };
}
FAChar.prototype._class += " common_FAChar";

FAChar.prototype.publish("char", "", "string", "Font Awesome Item", null, { tags: ["Private"] });
FAChar.prototype.publish("fontSize", null, "number", "Font Size", null, { tags: ["Private"] });
FAChar.prototype.publishProxy("text_colorFill", "_text", "colorFill");

/*
export class FAChar2 extends SVGGWidget {

    @publish("", "Font Awesome Item")
    char: publish<string, this>;

    @publish(null, "Font Size")
    fontSize: publish<number, this>;

    @publishProxy(null, "Font Size")
    text_colorFill: publish<number, this>;

    protected _text = new Text()
        .fontFamily("FontAwesome")
        ;

    constructor() {
        super();
    }

    enter(element) {
        super.enter(element);
        this._text
            .target(element.node())
            ;
        element
            .on("click", () => {
                this.click();
            })
            .on("dblclick", () => {
                this.dblclick();
            })
            ;
    }

    update(element) {
        super.update(element);
        this._text
            .text(this.char())
            .scale((this.fontSize() || 14) / 14) //  Scale rather than fontSize to prevent Chrome glitch  ---
            .render()
            ;
    }

    exit(element) {
        this._text
            .target(null)
            ;

        super.exit(element);
    }

    click() {
        console.log("Click:", this);
    }

    dblclick() {
        console.log("Double click:", this);
    }
}
// FAChar.prototype._class += " common_FAChar";
*/

import { SVGWidget } from "./SVGWidget";
import { Text } from "./Text";
import "css!font-awesome";
import "css!./FAChar";

export class FAChar extends SVGWidget {
    static _class = "common_FAChar";

    protected _text = new Text().fontFamily("FontAwesome");

    constructor() {
        super();
    }

    enter(domNode, element) {
        super.enter(domNode, element);
        this._text
            .target(domNode)
            ;
    };

    update(domNode, element) {
        super.update(domNode, element);
        this._text
            .text(this.char())
            .scale((this.fontSize() || 14) / 14) //  Scale rather than fontSize to prevent Chrome glitch  ---
            .render()
            ;
    };

    exit(domNode, element) {
        this._text
            .target(null)
            ;

        super.exit(domNode, element);
    };

    char: { (): string; (_: string): FAChar; }
    fontSize: { (): number; (_: number): FAChar; }
    text_colorFill: { (): string; (_: string): FAChar; }
}
FAChar.prototype.publish("char", "", "string", "Font Awesome Item", null, { tags: ["Private"] });
FAChar.prototype.publish("fontSize", null, "number", "Font Size", null, { tags: ["Private"] });
FAChar.prototype.publishProxy("text_colorFill", "_text", "colorFill");

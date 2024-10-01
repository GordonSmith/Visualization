import { publish } from "./PropertyExt.ts";
import { Widget } from "./Widget.ts";

export class WidgetArray extends Widget {

    @publish([], "widgetArray", "Widget Array")
    content: publish<this, Widget[]>;

    constructor() {
        super();
    }
}
WidgetArray.prototype._class += " common_WidgetArray";

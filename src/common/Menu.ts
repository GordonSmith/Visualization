import { event as d3Event, select as d3Select } from "d3-selection";
import { SVGWidget } from "./SVGWidget";
import { IMenu } from "./IMenu";
import { List } from "./List";
import { Icon } from "./Icon";
import "css!./Menu.css";

export function Menu() {
    SVGWidget.call(this);
    IMenu.call(this);

    this._icon = new Icon()
        .shape("square")
        .diameter(14)
        ;
    this._list = new List();

    var context = this;
    this._list.click = function (d) {
        d3Event.stopPropagation();
        context.hideMenu();
        context.click(d);
    };
    this._open = false;
}
Menu.prototype = Object.create(SVGWidget.prototype);
Menu.prototype.constructor = Menu;
Menu.prototype._class += " common_Menu";
Menu.prototype.implements(IMenu.prototype);

Menu.prototype.publishProxy("faChar", "_icon", null, "\uf0c9");
Menu.prototype.publishProxy("paddingPercent", "_icon", null, 10);

Menu.prototype.toggleMenu = function () {
    if (!this._open) {
        this.showMenu();
    } else {
        this.hideMenu();
    }
};

Menu.prototype.showMenu = function () {
    this.preShowMenu();
    this._open = true;
    this._list
        .data(this.data())
        .render()
        ;

    var bbox = this._icon.getBBox(true);
    var menuBBox = this._list.getBBox(true);
    var pos = {
        x: bbox.width / 2 - menuBBox.width / 2,
        y: bbox.height / 2 + menuBBox.height / 2
    };
    this._list
        .move(pos)
        ;
    var context = this;
    d3Select("body")
        .on("click." + this._id, function () {
            console.log("click:  body - " + context._id);
            if (context._open) {
                context.hideMenu();
            }
        })
        ;
};

Menu.prototype.hideMenu = function () {
    d3Select("body")
        .on("click." + this._id, null)
        ;
    this._open = false;
    this._list
        .data([])
        .render()
        ;
    this.postHideMenu();
};

Menu.prototype.enter = function (domNode, element) {
    SVGWidget.prototype.enter.apply(this, arguments);

    this._icon
        .target(domNode)
        .render()
        ;

    this._list
        .target(domNode)
        .render()
        ;

    var context = this;
    this._icon.element()
        .on("click", function (d) {
            d3Event.stopPropagation();
            context.toggleMenu();
        })
        ;
};

Menu.prototype.update = function (domNode, element) {
    SVGWidget.prototype.update.apply(this, arguments);
    element
        .classed("disabled", this.data().length === 0)
        ;

    this._icon
        .faChar(this.faChar())
        .paddingPercent(this.paddingPercent())
        .render()
        ;
};

Menu.prototype.exit = function (domNode, element) {
    this._icon
        .target(null)
        ;

    this._list
        .target(null)
        ;

    SVGWidget.prototype.exit.apply(this, arguments);
};

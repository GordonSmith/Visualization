import { publish } from "@hpcc-js/common";
import { HTMLWidget } from "@hpcc-js/common";
import { Grid, PagingGrid } from "@hpcc-js/dgrid-shim";

import "../src/Common.css";

export class Common extends HTMLWidget {
    protected _dgridDiv;
    protected _dgrid;
    protected _prevPaging;

    constructor() {
        super();
        this._tag = "div";
    }

    @publish(true, "boolean", "Enable paging")
    paging: { (): boolean, (_: boolean): Common };

    enter(domNode, element) {
        super.enter(domNode, element);
        this._dgridDiv = element.append("div");
    }

    update(domNode, element) {
        super.update(domNode, element);
        if (this._prevPaging !== this.paging()) {
            this._prevPaging = this.paging();
            let columns;
            let collection;
            if (this._dgrid) {
                columns = this._dgrid.get("columns");
                collection = this._dgrid.get("collection");
                this._dgrid.destroy();
                this._dgridDiv = element.append("div");
            }
            this._dgrid = new (this._prevPaging ? PagingGrid : Grid)({
                columns: columns || [],
                collection,
                selectionMode: "single",
                cellNavigation: false,
                pagingLinks: 1,
                pagingTextBox: true,
                previousNextArrows: true,
                firstLastArrows: true,
                rowsPerPage: 25,
                pageSizeOptions: [1, 10, 25, 100, 1000]
            }, this._dgridDiv.node());
            this._dgrid.on("dgrid-select", (evt) => {
                if (evt.rows && evt.rows.length) {
                    this.click(evt.rows[0].data.__hpcc_orig, "", true);
                }
            });
        }
        this._dgridDiv
            .style("width", this.width() + "px")
            .style("height", this.height() - 2 + "px")
            ;
        this._dgrid.resize();
    }

    click(row, col, sel) {
        console.log(row, col, sel);
    }
}
Common.prototype._class += " dgrid_Common";

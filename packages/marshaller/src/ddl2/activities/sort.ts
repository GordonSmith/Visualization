import { PropertyExt, publish } from "@hpcc-js/common";
import { IField } from "@hpcc-js/dgrid";
import { hashSum } from "@hpcc-js/util";
import { ascending as d3Ascending, descending as d3Descending } from "d3-array";
import { Activity } from "./activity";
import { View } from "./view";

export class SortColumn extends PropertyExt {
    private _view: View;
    private _owner: Sort;

    @publish(null, "set", "Sort Field", function (this: SortColumn) { return this.fieldIDs(); }, { optional: true })
    fieldID: publish<this, string>;
    @publish(null, "boolean", "Sort Field")
    descending: publish<this, boolean>;

    constructor(owner: Sort) {
        super();
        this._view = owner._owner;
        this._owner = owner;
    }

    hash(): string {
        return hashSum({
            sortColumn: this.fieldID(),
            descending: this.descending()
        });
    }

    fieldIDs() {
        return this._owner.fieldIDs();
    }

    field(id: string): IField | undefined {
        return this._view.inFields().filter(field =>
            field.id === id
        )[0];
    }
}
SortColumn.prototype._class += " SortColumn";

//  ===========================================================================
export class Sort extends Activity {
    _owner: View;

    @publish([], "propertyArray", "Source Columns", null, { autoExpand: SortColumn })
    column: publish<this, SortColumn[]>;

    constructor(owner: View) {
        super();
        this._owner = owner;
    }

    hash(): string {
        return hashSum({
            Sort: this.column().map(sb => sb.hash())
        });
    }

    validSortBy(): SortColumn[] {
        return this.column().filter(sortBy => sortBy.fieldID());
    }

    exists(): boolean {
        return this.validSortBy().length > 0;
    }

    fieldIDs(): string[] {
        return this.inFields().map(field => field.id);
    }

    pullData(): object[] {
        const data = super.pullData();
        const sortByArr: Array<{ descending: boolean, id: string }> = [];
        for (const sortBy of this.validSortBy()) {
            sortByArr.push({
                descending: sortBy.descending(),
                id: sortBy.fieldID()
            });
        }

        if (sortByArr.length) {
            return data.sort((l: any, r: any) => {
                for (const item of sortByArr) {
                    const retVal2 = (item.descending ? d3Descending : d3Ascending)(l[item.id], r[item.id]);
                    if (retVal2 !== 0) {
                        return retVal2;
                    }
                }
                return 0;
            });

        }
        return data;
    }
}
Sort.prototype._class += " Sort";

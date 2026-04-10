import { DDL2 } from "@hpcc-js/ddl-shim";
import { Activity } from "./activity.ts";
import { Databomb } from "./databomb.ts";
import { Form } from "./form.ts";
import { LogicalFile } from "./logicalfile.ts";
import { RoxieResult, RoxieService } from "./roxie.ts";
import { WU, WUResult } from "./wuresult.ts";

let datasourceID = 0;
export class Datasource extends Activity {

    constructor() {
        super();
        this._id = `ds_${++datasourceID}`;
    }
}

export type DatasourceRefType = Databomb | Form | LogicalFile | RoxieResult | WUResult;
export type DatasourceType = Databomb | Form | LogicalFile | RoxieService | WU;

export class DatasourceRef extends Activity {
    _datasource: DatasourceRefType;
    datasource(): DatasourceRefType;
    datasource(_: DatasourceRefType): this;
    datasource(_?: DatasourceRefType): this | DatasourceRefType {
        if (!arguments.length) return this._datasource;
        this._datasource = _;
        this.sourceActivity(_);
        return this;
    }

    constructor() {
        super();
    }

    hash(more: { [key: string]: any } = {}): string {
        return super.hash({
            datasource: this._datasource ? this._datasource.hash(more) : undefined,
            ...more
        });
    }

    toDDL(): DDL2.IDatabombRef {
        return {
            id: this.id()
        };
    }
}
DatasourceRef.prototype._class += " DatasourceRef";


DatasourceRef.prototype.publish("_datasource", null, "widget", "Datasource Reference", null, { internal: true });
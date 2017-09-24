import { PropertyExt, publish } from "@hpcc-js/common";
import { Query as CommsQuery, RequestType } from "@hpcc-js/comms";
import { IField } from "@hpcc-js/dgrid";
import { compare, hashSum } from "@hpcc-js/util";
import { Viz } from "../viz";
import { Activity, ReferencedFields, schemaRow2IField } from "./activity";
import { View } from "./view";

export class Param extends PropertyExt {
    private _view: View;
    private _owner: RoxieService;

    @publish(null, "set", "Datasource", function (this: Param) { return this.visualizationIDs(); }, { optional: true })
    source: publish<this, string>;
    source_exists: () => boolean;
    @publish(null, "set", "Source Field", function (this: Param) { return this.sourceFields(); }, { optional: true })
    remoteFieldID: publish<this, string>;
    remoteFieldID_exists: () => boolean;
    @publish(null, "string", "Label")  //  TODO Add ReadOnly
    localFieldID: publish<this, string>;
    localFieldID_exists: () => boolean;

    constructor(owner: RoxieService) {
        super();
        this._view = owner._owner;
        this._owner = owner;
    }

    hash() {
        return hashSum({
            label: this.localFieldID(),
            source: this.source(),
            sourceField: this.remoteFieldID(),
        });
    }

    visualizationIDs() {
        return this._view._dashboard.visualizationIDs();
    }

    sourceFields() {
        return this.sourceOutFields().map(field => field.label);
    }

    sourceViz(): Viz {
        return this._view._dashboard.visualization(this.source());
    }

    sourceOutFields(): IField[] {
        return this.sourceViz().view().outFields();
    }

    sourceSelection(): any[] {
        return this.sourceViz().state().selection();
    }

    exists(): boolean {
        return this.localFieldID_exists() && this.source_exists() && this.remoteFieldID_exists();
    }
}
Param.prototype._class += " ColumnMapping";

export class RoxieService extends Activity {
    _owner: View;
    private _query: CommsQuery;
    private _data: any[] = [];

    @publish("", "string", "ESP Url (http://x.x.x.x:8010)")
    url: publish<this, string>;
    @publish("", "string", "Query Set")
    querySet: publish<this, string>;
    @publish("", "string", "Query ID")
    queryID: publish<this, string>;
    @publish("", "string", "Result Name")
    resultName: publish<this, string>;
    @publish([], "propertyArray", "Request Fields")
    _request: Param[];
    request(): Param[];
    request(_: Param[]): this;
    request(_?: Param[]): Param[] | this {
        if (!arguments.length) return this._request;
        this._request = _;
        return this;
    }

    constructor(owner: View) {
        super();
        this._owner = owner;
    }

    sourceHash(): string {
        return hashSum({
            url: this.url(),
            querySet: this.querySet(),
            queryId: this.queryID()
        });
    }

    hash(): string {
        return hashSum({
            source: this.sourceHash(),
            params: this.request().map(param => param.hash())
        });
    }

    label(): string {
        return `${this.queryID()}\n${this.resultName()}`;
    }

    referencedFields(refs: ReferencedFields): void {
        super.referencedFields(refs);
        const localFieldIDs: string[] = [];
        for (const param of this.validParams()) {
            const filterSource = param.sourceViz().view();
            localFieldIDs.push(param.localFieldID());
            filterSource.resolveFields(refs, [param.remoteFieldID()]);
        }
        super.resolveFields(refs, localFieldIDs);
    }

    validParams() {
        return this.request().filter(param => param.exists());
    }

    fullUrl(_: string): this {
        // "http://10.241.100.157:8002/WsEcl/submit/query/roxie/carmigjx_govbisgsavi.Ins4621360_Service_00000006/json",
        const parts = _.split("/WsEcl/submit/query/");
        if (parts.length < 2) throw new Error(`Invalid roxie URL:  ${_}`);
        const urlParts = parts[0].split(":");
        if (urlParts.length < 3) throw new Error(`Invalid roxie URL:  ${_}`);
        this.url(`${urlParts[0]}:${urlParts[1]}:${urlParts[2] === "18002" ? "18010" : "8010"}`);
        const roxieParts = parts[1].split("/");
        if (roxieParts.length < 2) throw new Error(`Invalid roxie URL:  ${_}`);
        this.querySet(roxieParts[0]);
        this.queryID(roxieParts[1]);
        return this;
    }

    private _prevSourceHash: string;
    private refreshMetaPromise: Promise<void>;
    refreshMeta(): Promise<void> {
        if (this._prevSourceHash !== this.sourceHash()) {
            this._prevSourceHash = this.sourceHash();
            delete this.refreshMetaPromise;
        }
        if (!this.refreshMetaPromise) {
            this.refreshMetaPromise = super.refreshMeta().then(() => {
                return CommsQuery.attach({ baseUrl: this.url(), type: RequestType.JSONP }, this.querySet(), this.queryID());
            }).then((query) => {
                this._query = query;
                const oldParams = this.request();
                const diffs = compare(oldParams.map(p => p.localFieldID()), this.requestFields().map(ff => ff.label));
                const newParams = oldParams.filter(op => diffs.unchanged.indexOf(op.localFieldID()) >= 0);
                this.request(newParams.concat(diffs.added.map(label => new Param(this).localFieldID(label))));
            });
        }
        return this.refreshMetaPromise;
    }

    updatedBy(): string[] {
        return this.validParams().map(param => param.source());
    }

    outFields(): IField[] {
        if (this._query) {
            const responseSchema = this._query.fields(this.resultName());
            return responseSchema.map(schemaRow2IField);
        }
        return [];
    }

    exec(): Promise<void> {
        return super.exec().then(() => {
            const request: { [key: string]: any } = {};
            for (const param of this.validParams()) {
                const sourceSelection = param.sourceSelection();
                if (sourceSelection.length) {
                    request[param.localFieldID()] = sourceSelection[0][param.remoteFieldID()];
                }
            }
            return this._query.submit(request);
        }).then((response: { [key: string]: any }) => {
            this._data = response[this.resultName()];
        });
    }

    pullData(): object[] {
        return this._data;
    }

    //  ===
    requestFields(): IField[] {
        if (this._query) {
            const responseSchema = this._query.requestFields();
            return responseSchema.map(schemaRow2IField);
        }
        return [];
    }
}
RoxieService.prototype._class += " Filters";

export class HipieService extends RoxieService {
}

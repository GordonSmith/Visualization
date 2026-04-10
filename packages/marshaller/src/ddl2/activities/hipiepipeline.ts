import { DDL2 } from "@hpcc-js/ddl-shim";
import { ElementContainer } from "../model/element.ts";
import { Activity, ActivityPipeline } from "./activity.ts";
import { DatasourceRefType } from "./datasource.ts";
import { DSPicker } from "./dspicker.ts";
import { Filters } from "./filter.ts";
import { GroupBy } from "./groupby.ts";
import { Limit } from "./limit.ts";
import { Project } from "./project.ts";
import { Sort } from "./sort.ts";

export class HipiePipeline extends ActivityPipeline {

    _datasource: DSPicker | DatasourceRefType;
    datasource(): DSPicker | DatasourceRefType;
    datasource(_: DSPicker | DatasourceRefType): this;
    datasource(_?: DSPicker | DatasourceRefType): DSPicker | DatasourceRefType | this {
        if (!arguments.length) return this._datasource;
        this._datasource = _;
        this.updateSequence();
        return this;
    }

    _filters: Filters;
    filters(): Filters;
    filters(_: Filters): this;
    filters(_?: Filters): Filters | this {
        if (!arguments.length) return this._filters;
        this._filters = _;
        this.updateSequence();
        return this;
    }

    _project: Project;
    project(): Project;
    project(_: Project): this;
    project(_?: Project): Project | this {
        if (!arguments.length) return this._project;
        this._project = _;
        this.updateSequence();
        return this;
    }

    _groupBy: GroupBy;
    groupBy(): GroupBy;
    groupBy(_: GroupBy): this;
    groupBy(_?: GroupBy): GroupBy | this {
        if (!arguments.length) return this._groupBy;
        this._groupBy = _;
        this.updateSequence();
        return this;
    }

    _sort: Sort;
    sort(): Sort;
    sort(_: Sort): this;
    sort(_?: Sort): Sort | this {
        if (!arguments.length) return this._sort;
        this._sort = _;
        this.updateSequence();
        return this;
    }

    _limit: Limit;
    limit(): Limit;
    limit(_: Limit): this;
    limit(_?: Limit): Limit | this {
        if (!arguments.length) return this._limit;
        this._limit = _;
        this.updateSequence();
        return this;
    }

    constructor(private _ec: ElementContainer, viewID: string) {
        super();
        this._id = viewID;
        this._datasource = new DSPicker(this._ec);
        this._filters = new Filters(this._ec);
        this._project = new Project();
        this._groupBy = new GroupBy();
        this._sort = new Sort();
        this._limit = new Limit();
        this.updateSequence();
    }

    activities(): Activity[];
    activities(_: Activity[]): this;
    activities(_?: Activity[]): Activity[] | this {
        const retVal = super.activities.apply(this, arguments);
        return retVal;
    }

    private updateSequence() {
        this.activities([
            this.datasource() as Activity,
            this.filters(),
            this.project(),
            this.groupBy(),
            this.sort(),
            this.limit()
        ]);
    }

    selectionFields(): ReadonlyArray<DDL2.IField> {
        return this.last().outFields();
    }
}


HipiePipeline.prototype.publish("_datasource", null, "widget", "Data Source 2");
HipiePipeline.prototype.publish("_filters", null, "widget", "Client Filters");
HipiePipeline.prototype.publish("_project", null, "widget", "Project");
HipiePipeline.prototype.publish("_groupBy", null, "widget", "Group By");
HipiePipeline.prototype.publish("_sort", null, "widget", "Sort");
HipiePipeline.prototype.publish("_limit", null, "widget", "Limit output");
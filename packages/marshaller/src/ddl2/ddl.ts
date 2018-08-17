import { DDL2 } from "@hpcc-js/ddl-shim";
import { scopedLogger } from "@hpcc-js/util";
import { ActivityPipeline, ReferencedFields } from "./activities/activity";
import { Filters } from "./activities/filter";
import { GroupBy } from "./activities/groupby";
import { Limit } from "./activities/limit";
import { Mappings, Project } from "./activities/project";
import { Sort } from "./activities/sort";
import { Dashboard } from "./dashboard";
import { Databomb, Form } from "./datasources/databomb";
import { Datasource } from "./datasources/datasource";
import { DSPicker } from "./datasources/dspicker";
import { LogicalFile } from "./datasources/logicalfile";
import { HipieRequest, Param, RoxieRequest } from "./datasources/roxie";
import { WUResult } from "./datasources/wuresult";
import { Element, ElementContainer } from "./model/element";
import { Visualization } from "./model/visualization";

const logger = scopedLogger("marshaller/ddl2/ddl");

function mergeFieldArray(targetArr: DDL2.IField[], sourceArr: DDL2.IField[]): DDL2.IField[] {
    const existing: string[] = targetArr.map(f => f.id);
    return targetArr.concat(sourceArr.filter(f => existing.indexOf(f.id) < 0));
}

class DDLDatasourceAdapter {
    private _dsDedup: { [key: string]: DDL2.DatasourceType };
    private _dsDedupID: { [key: string]: DDL2.DatasourceType };

    constructor() {
    }

    private hash(ds: Datasource): string {
        const dsDetails = ds instanceof DSPicker ? ds.selection() : ds;
        if (dsDetails instanceof RoxieRequest || dsDetails instanceof WUResult) {
            return dsDetails.sourceHash();
        }
        return dsDetails.hash();
    }

    private writeDatasource(ds: Datasource): DDL2.DatasourceType {
        const dsDetails = ds instanceof DSPicker ? ds.selection() : ds;
        if (dsDetails instanceof WUResult) {
            const ddl: DDL2.IWUResult = {
                type: "wuresult",
                id: ds.id(),
                url: dsDetails.url(),
                wuid: dsDetails.wuid(),
                outputs: {}
            };
            return ddl;
        } else if (dsDetails instanceof LogicalFile) {
            const ddl: DDL2.ILogicalFile = {
                type: "logicalfile",
                id: ds.id(),
                url: dsDetails.url(),
                logicalFile: dsDetails.logicalFile(),
                fields: []
            };
            return ddl;
        } else if (dsDetails instanceof Form) {
            const ddl: DDL2.IForm = {
                type: "form",
                id: ds.id(),
                fields: []
            };
            return ddl;
        } else if (dsDetails instanceof Databomb) {
            const ddl: DDL2.IDatabomb = {
                type: "databomb",
                id: ds.id(),
                fields: [],
                format: dsDetails.format()
            };
            return ddl;
        } else if (dsDetails instanceof HipieRequest) {
            const ddl: DDL2.IHipieService = {
                type: "hipie",
                id: ds.id(),
                url: dsDetails.url(),
                querySet: dsDetails.querySet(),
                queryID: dsDetails.queryID(),
                inputs: [],
                outputs: {}
            };
            return ddl;
        } else if (dsDetails instanceof RoxieRequest) {
            const ddl: DDL2.IRoxieService = {
                type: "roxie",
                id: ds.id(),
                url: dsDetails.url(),
                querySet: dsDetails.querySet(),
                queryID: dsDetails.queryID(),
                inputs: [],
                outputs: {}
            };
            return ddl;
        }
        return undefined;
    }

    clear() {
        this._dsDedup = {};
        this._dsDedupID = {};
    }

    set(ds: DDL2.DatasourceType) {
        this._dsDedup[ds.id] = ds;
        this._dsDedupID[ds.id] = ds;
    }

    get(ds: Datasource): DDL2.DatasourceType {
        const dsID = this.hash(ds);
        let retVal: DDL2.DatasourceType = this._dsDedup[dsID];
        if (!retVal) {
            retVal = this.writeDatasource(ds);
            this._dsDedup[dsID] = retVal;
        }
        this._dsDedupID[ds.id()] = retVal;
        return retVal;
    }

    getByID(dsID: string): DDL2.DatasourceType {
        return this._dsDedupID[dsID];
    }

    getAll(): DDL2.DatasourceType[] {
        const retVal: DDL2.DatasourceType[] = [];
        for (const key in this._dsDedup) {
            retVal.push(this._dsDedup[key]);
        }
        return retVal;
    }

    updateDSFields(ds: Datasource, refs: ReferencedFields) {
        const ddlDatasource = this.getByID(ds.id());
        const dsDetails = ds instanceof DSPicker ? ds.selection() : ds;
        if (dsDetails instanceof RoxieRequest) {
            const inFields = dsDetails.localFields().filter(field => refs.inputs[dsDetails.id()] && refs.inputs[dsDetails.id()].indexOf(field.id) >= 0);
            (ddlDatasource as DDL2.IRoxieService).inputs = mergeFieldArray((ddlDatasource as DDL2.IRoxieService).inputs, inFields.toJS());
        }
        const outFields = dsDetails.localFields().filter(field => refs.outputs[dsDetails.id()] && refs.outputs[dsDetails.id()].indexOf(field.id) >= 0);
        if (dsDetails instanceof RoxieRequest || dsDetails instanceof WUResult) {
            const result: DDL2.IOutput = (ddlDatasource as DDL2.IRoxieService).outputs[dsDetails.resultName()] || { fields: [] };
            result.fields = mergeFieldArray(result.fields, outFields.toJS());
            (ddlDatasource as DDL2.IRoxieService).outputs[dsDetails.resultName()] = result;
        } else {
            (ddlDatasource as DDL2.IDatasource).fields = mergeFieldArray((ddlDatasource as DDL2.IDatasource).fields, outFields.toJS());
        }
    }
}

export class DDLAdapter {
    private _dashboard: Dashboard;
    private _elementContainer: ElementContainer;
    private _dsDedup: DDLDatasourceAdapter = new DDLDatasourceAdapter();

    constructor(dashboard: Dashboard) {
        this._dashboard = dashboard;
        this._elementContainer = this._dashboard.elementContainer();
    }

    readDatasource(_ddlDS: DDL2.DatasourceType, ds: Datasource): this {
        if (ds instanceof DSPicker) {
            ds
                .id(_ddlDS.id)
                // .type(_ddlDS.type)
                ;
        }
        const dsDetails = ds instanceof DSPicker ? ds.selection() : ds;
        if (dsDetails instanceof WUResult) {
            const ddlDS = _ddlDS as DDL2.IWUResult;
            dsDetails
                .url(ddlDS.url)
                .wuid(ddlDS.wuid)
                ;
        } else if (dsDetails instanceof LogicalFile) {
            const ddlDS = _ddlDS as DDL2.ILogicalFile;
            dsDetails
                .url(ddlDS.url)
                .logicalFile(ddlDS.logicalFile)
                ;
        } else if (dsDetails instanceof Form) {
            const ddlDS = _ddlDS as DDL2.IForm;
            const payload = {};
            for (const field of ddlDS.fields) {
                switch (field.type) {
                    case "boolean":
                        payload[field.id] = field.default || false;
                        break;
                    case "number":
                        payload[field.id] = field.default || 0;
                        break;
                    case "string":
                    default:
                        payload[field.id] = field.default || "";
                        break;
                }
            }
            dsDetails.payload(payload);
        } else if (dsDetails instanceof Databomb) {
            const ddlDS = _ddlDS as DDL2.IDatabomb;
            dsDetails.format(ddlDS.format);
        } else if (dsDetails instanceof RoxieRequest) {
            const ddlDS = _ddlDS as DDL2.IRoxieService;
            dsDetails
                .url(ddlDS.url)
                .querySet(ddlDS.querySet)
                .queryID(ddlDS.queryID)
                ;
        }
        return this;
    }

    writeDatasources(): DDL2.DatasourceType[] {
        for (const viz of this._elementContainer.elements()) {
            const ds = viz.hipiePipeline().datasource();

            //  Prime ds;
            this._dsDedup.get(ds);
        }
        return this._dsDedup.getAll();
    }

    writeFilters(filters: Filters): DDL2.IFilter {
        if (!filters.exists()) return undefined;
        return filters.toDDL();
    }

    readFilters(ddlFilter: DDL2.IFilter, ec: ElementContainer): Filters {
        return Filters.fromDDL(ec, ddlFilter);
    }

    writeProject(project: Project): DDL2.IProject {
        if (!project.exists()) return undefined;
        return project.toDDL();
    }

    readProject(ddlProject: DDL2.IProject): Project {
        return Project.fromDDL(ddlProject);
    }

    writeMappings(mappings: Mappings): DDL2.IMappings {
        if (!mappings.exists()) return { type: "mappings", transformations: [] };
        return mappings.toDDL();
    }

    readMappings(ddlProject: DDL2.IMappings): Mappings {
        return Mappings.fromDDL(ddlProject);
    }

    writeGroupBy(gb: GroupBy): DDL2.IGroupBy {
        if (!gb.exists()) return undefined;
        return gb.toDDL();
    }

    readGroupBy(ddlGB: DDL2.IGroupBy): GroupBy {
        return GroupBy.fromDDL(ddlGB);
    }

    writeSort(sort: Sort): DDL2.ISort {
        if (!sort.exists()) return undefined;
        return sort.toDDL();
    }

    readSort(ddlSort: DDL2.ISort): Sort {
        return Sort.fromDDL(ddlSort);
    }

    writeLimit(limit: Limit): DDL2.ILimit {
        if (!limit.exists()) return undefined;
        return limit.toDDL();
    }

    readLimit(ddlLimit: DDL2.ILimit): Limit {
        return Limit.fromDDL(ddlLimit);
    }

    writeDatasourceRef(ds: Datasource): DDL2.IWUResultRef | DDL2.IRoxieServiceRef | DDL2.IDatasourceRef {
        const dsDetails = ds instanceof DSPicker ? ds.selection() : ds;
        if (dsDetails instanceof RoxieRequest) {
            const retVal: DDL2.IRoxieServiceRef = {
                id: this._dsDedup.get(ds).id,
                request: dsDetails.request().filter(rf => rf.source()).map((rf): DDL2.IRequestField => {
                    return {
                        source: rf.source(),
                        remoteFieldID: rf.remoteField(),
                        localFieldID: rf.localField()
                    };
                }),
                output: dsDetails.resultName()
            };
            return retVal;
        } else if (dsDetails instanceof WUResult) {
            return {
                id: this._dsDedup.get(ds).id,
                output: dsDetails.resultName()
            } as DDL2.IWUResultRef;
        }
        const retVal: DDL2.IDatasourceRef = {
            id: this._dsDedup.get(ds).id
        };
        return retVal;
    }

    readDatasourceRef(ddlDSRef: DDL2.IRoxieServiceRef | DDL2.IDatasourceRef, ds: Datasource, elementContainer: ElementContainer): this {
        const ddlDS = this._dsDedup.getByID(ddlDSRef.id);
        this.readDatasource(ddlDS, ds);
        const dsDetails = ds instanceof DSPicker ? ds.selection() : ds;
        if (dsDetails instanceof WUResult && DDL2.isWUResultRef(ddlDSRef)) {
            dsDetails
                .resultName(ddlDSRef.output)
                .responseFields((ddlDS as DDL2.IWUResult).outputs[ddlDSRef.output].fields)
                ;
        } else if (dsDetails instanceof RoxieRequest && DDL2.isRoxieServiceRef(ddlDSRef)) {
            dsDetails
                .resultName(ddlDSRef.output)
                .request(ddlDSRef.request.map(rf => {
                    return new Param(this._elementContainer)
                        .source(rf.source)
                        .remoteField(rf.remoteFieldID)
                        .localField(rf.localFieldID)
                        ;
                }))
                .responseFields((ddlDS as DDL2.IRoxieService).outputs[ddlDSRef.output].fields)
                ;
        }
        return this;
    }

    writeActivities(view: ActivityPipeline): DDL2.ActivityType[] {
        return view.activities().map(activity => {
            if (activity instanceof Filters) {
                return this.writeFilters(activity);
            } else if (activity instanceof Project) {
                return this.writeProject(activity);
            } else if (activity instanceof GroupBy) {
                return this.writeGroupBy(activity);
            } else if (activity instanceof Sort) {
                return this.writeSort(activity);
            } else if (activity instanceof Limit) {
                return this.writeLimit(activity);
            } else if (activity instanceof Mappings) {
                return this.writeMappings(activity);
            } else {
                logger.warning(`Unknown activity type:  ${activity.classID()}`);
            }
        }).filter(activity => !!activity);
    }

    writeVisualization(visualization: Visualization): DDL2.IVisualization {
        return {
            id: visualization.chartPanel().id(),
            title: visualization.title(),
            description: visualization.description(),
            chartType: visualization.chartType(),
            __class: visualization.chartPanel().widget().classID(),
            mappings: this.writeMappings(visualization.mappings()),
            properties: visualization.properties()
        };
    }

    readVisualization(ddlViz: DDL2.IVisualization, visualization: Visualization): this {
        const mappings = this.readMappings(ddlViz.mappings);
        mappings.trim(true);
        visualization.chartPanel().id(ddlViz.id);
        visualization
            .title(ddlViz.title)
            .description(ddlViz.description)
            .chartType(ddlViz.chartType as any)
            .properties(ddlViz.properties)
            .mappings(mappings)
            ;
        return this;
    }

    writeDDLViews(): DDL2.IView[] {
        //  Gather referenced fields  ---
        const refFields: ReferencedFields = { inputs: {}, outputs: {} };
        for (const element of this._elementContainer.elements()) {
            element.visualization().mappings().referencedFields(refFields);
        }

        return this._elementContainer.elements().map(element => {
            const view = element.hipiePipeline();
            const ds = view.datasource();
            const retVal = {
                id: element.id(),
                datasource: this.writeDatasourceRef(ds),
                activities: this.writeActivities(view),
                visualization: this.writeVisualization(element.visualization())
            };
            this._dsDedup.updateDSFields(ds, refFields);
            return retVal;
        });
    }

    writeProperties(): DDL2.IWidgetProperties {
        return {
            layout: this._dashboard.layout() as any
        };
    }

    readDDLViews(ddlViews: DDL2.IView[]) {
        for (const ddlView of ddlViews) {
            const element = new Element(this._elementContainer).id(ddlView.id);
            this._elementContainer.append(element);
            const hipiePipeline = element.hipiePipeline();
            this.readDatasourceRef(ddlView.datasource, hipiePipeline.datasource(), this._elementContainer);
            for (const activity of ddlView.activities) {
                if (DDL2.isProjectActivity(activity)) {
                    const project = this.readProject(activity);
                    hipiePipeline.project(project);
                }
                if (DDL2.isFilterActivity(activity)) {
                    const filters = this.readFilters(activity, this._elementContainer);
                    hipiePipeline.filters(filters);
                }
                if (DDL2.isGroupByActivity(activity)) {
                    const groupBy = this.readGroupBy(activity);
                    hipiePipeline.groupBy(groupBy);
                }
                if (DDL2.isSortActivity(activity)) {
                    const sort = this.readSort(activity);
                    hipiePipeline.sort(sort);
                }
                if (DDL2.isLimitActivity(activity)) {
                    const limit = this.readLimit(activity);
                    hipiePipeline.limit(limit);
                }
            }
            this.readVisualization(ddlView.visualization, element.visualization());
        }
    }

    readProperties(properties: DDL2.IWidgetProperties) {
        if (properties && properties.layout) {
            this._dashboard.layoutObj(properties.layout as object);
        }
    }

    write(): DDL2.Schema {
        this._dsDedup.clear();
        const retVal: DDL2.Schema = {
            version: "0.0.22",
            datasources: this.writeDatasources(),
            dataviews: this.writeDDLViews(),
            properties: this.writeProperties()
        };
        return retVal;
    }

    read(ddl: DDL2.Schema) {
        this._dsDedup.clear();
        for (const ds of ddl.datasources) {
            this._dsDedup.set(ds);
        }
        this.readDDLViews(ddl.dataviews);
        this.readProperties(ddl.properties);
    }
}

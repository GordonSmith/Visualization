import { PropertyExt, publish, Widget } from "@hpcc-js/common";
import { IOptionsSend } from "@hpcc-js/comms";
import { DDL2 } from "@hpcc-js/ddl-shim";
import { find, hashSum, isArray } from "@hpcc-js/util";
import { Activity, IActivityError } from "../activities/activity";
import { emptyDatabomb } from "../activities/databomb";
import { DatasourceRefType } from "../activities/datasource";
import { HipiePipeline } from "../activities/hipiepipeline";
import { Mappings } from "../activities/project";
import { Visualization } from "./visualization";
import { VizChartPanel } from "./vizChartPanel";

export class State extends PropertyExt {

    constructor() {
        super();
        this.selection([]);
    }

    set(_: Array<{ [key: string]: any }>): boolean {
        const currSelHash = hashSum(this.selection());
        const newSelHash = hashSum(_);
        if (currSelHash !== newSelHash) {
            this.selection(_);
            return true;
        }
        return false;
    }

    removeInvalid(data: ReadonlyArray<object>): boolean {
        const currSelection = this.selection();
        const newSelection: object[] = [];
        for (const selRow of currSelection) {
            if (find(data, (row: { [key: string]: any }, index): boolean => {
                for (const column in selRow) {
                    if (selRow[column] !== row[column]) {
                        return false;
                    }
                }
                return true;
            })) {
                newSelection.push(selRow);
            }
        }
        if (newSelection.length !== currSelection.length) {
            this.selection(newSelection);
            return true;
        }
        return false;
    }
}
State.prototype._class += " State";
export interface State {
    selection(): Array<{ [key: string]: any }>;
    selection(_: Array<{ [key: string]: any }>): this;
}
State.prototype.publish("selection", [], "array", "State");

let vizID = 0;
export class Element extends PropertyExt {
    private _vizChartPanel: Visualization;

    // @publishProxy("_MultiChartPanel")
    // title: publish<this, string>;
    @publish(null, "widget", "Data View")
    hipiePipeline: publish<this, HipiePipeline>;
    @publish(null, "widget", "Visualization")
    _visualization: Visualization;
    visualization(): Visualization;
    visualization(_: Visualization): this;
    visualization(_?: Visualization): Visualization | this {
        if (!arguments.length) return this._visualization;
        this._visualization = _;
        this._visualization
            .on("click", (_row: object | object[], col: string, sel: boolean, more?) => {
                if (more && more.selection) {
                    this.selection(sel ? more.selection.map(r => r.__lparam || r) : []);
                } else {
                    const row: any[] = isArray(_row) ? _row : [_row];
                    this.selection(sel ? row.map(r => r.__lparam || r) : []);
                }
            })
            .on("vertex_click", (_row: object | object[], col: string, sel: boolean) => {
                const row: any[] = isArray(_row) ? _row : [_row];
                this.selection(sel ? row.map(r => r.__lparam || r) : []);
            })
            ;
        return this;
    }
    @publish(null, "widget", "State")
    state: publish<this, State>;

    constructor(private _ec: ElementContainer) {
        super();
        while (true) {
            vizID++;
            this._id = `e_${vizID}`;
            if (!this._ec.elementExists(this._id)) {
                break;
            }
        }
        const view = new HipiePipeline(this._ec, this._id);
        this.hipiePipeline(view);
        this._vizChartPanel = new Visualization(this._ec, this.hipiePipeline())
            .id(`viz_${vizID}`)
            .title(`Element ${vizID}`)
            ;
        this._vizChartPanel.chartPanel().id(`cp_${vizID}`);
        this.visualization(this._vizChartPanel);
        this.state(new State());
    }

    id(): string;
    id(_: string): this;
    id(_?: string): string | this {
        const retVal = super.id.apply(this, arguments);
        if (arguments.length) {
            this._vizChartPanel.id(_);
        }
        return retVal;
    }

    chartType(): string {
        return this._vizChartPanel.chartType();
    }

    chartPanel(): VizChartPanel;
    chartPanel(_: VizChartPanel): this;
    chartPanel(_?: VizChartPanel): VizChartPanel | this {
        if (!arguments.length) return this._vizChartPanel.chartPanel();
        this._vizChartPanel.chartPanel(_);
        return this;
    }

    chart(): Widget {
        return this._vizChartPanel.chartPanel().widget();
    }

    mappings(): Mappings;
    mappings(_: Mappings): this;
    mappings(_?: Mappings): Mappings | this {
        if (!arguments.length) return this._vizChartPanel.mappings();
        this._vizChartPanel.mappings(_);
        return this;
    }

    pipeline(activities: Activity[]): this {
        this.hipiePipeline()
            .activities(activities)
            ;
        return this;
    }

    updatedBy(): string[] {
        return this.hipiePipeline().updatedBy();
    }

    dependentOn(): string[] {
        const retVal = [];
        if (this.visualization().secondaryDataviewID_exists()) {
            retVal.push(this.visualization().secondaryDataviewID());
        }
        return retVal;
    }

    dataProps(): PropertyExt {
        return this.hipiePipeline();
    }

    vizProps(): Widget {
        return this.visualization().chartPanel();
    }

    stateProps(): PropertyExt {
        return this.state();
    }

    private _errors: IElementError[] = [];
    errors(): IElementError[] {
        return this._errors;
    }

    validate(): IElementError[] {
        if (!this._initialized) {
            return [];
        }
        this._errors = [];
        const pipeline = this.hipiePipeline();
        for (const activity of [...pipeline.activities(), this.mappings()]) {
            for (const error of activity.validate()) {
                this._errors.push({
                    elementID: this.id(),
                    ...error
                });
            }
        }
        return this._errors;
    }

    private _initialized = false;
    refresh(): Promise<void> {
        const filters = this.hipiePipeline().filters().validFilters();
        const desc: string[] = filters.map(f => f.createFilterDescription());
        this.visualization().chartPanel().description(desc.join(", "));
        return this.visualization().refresh().then(() => {
            this._initialized = true;
            const data = this.hipiePipeline().outData();
            if (this.visualization().chartType() === "FieldForm") {
                if (this.state().set([...data])) {
                    this.selectionChanged();
                }
            } else {
                if (this.state().removeInvalid(data)) {
                    this.selectionChanged();
                }
            }
        });
    }

    //  Selection  ---
    selection(): object[];
    selection(_: object[]): this;
    selection(_?: object[]): object[] | this {
        if (!arguments.length) return this.state().selection();
        this.state().selection(_);
        this.selectionChanged();
        return this;
    }

    //  Events  ---
    selectionChanged() {
        const firstPass: Array<Promise<void>> = [];
        const secondPass: Array<Promise<void>> = [];

        const needsRefresh = this._ec.filteredBy(this.id());
        needsRefresh.forEach(filteredViz => {
            if (!filteredViz.visualization().secondaryDataviewID_exists()) {
                firstPass.push(filteredViz.refresh());
            } else {
                secondPass.push(filteredViz.refresh());
            }
        });
        Promise.all(firstPass).then(() => {
            Promise.all(secondPass).then(() => {
                this._ec.vizStateChanged(this);
            });
        });
    }

    monitor(func: (id: string, newVal: any, oldVal: any, source: PropertyExt) => void): { remove: () => void; } {
        return this.hipiePipeline().monitor(func);
    }
}
Element.prototype._class += " Viz";

export interface IPersist {
    ddl: DDL2.Schema;
    layout: any;
}

export interface IElementError extends IActivityError {
    elementID: string;
}

export class ElementContainer extends PropertyExt {

    private _nullElement;

    private _datasources: DatasourceRefType[] = [emptyDatabomb];
    private _elements: Element[] = [];

    @publish(10, "number", "Number of samples")
    samples: publish<this, number>;
    @publish(100, "number", "Sample size")
    sampleSize: publish<this, number>;

    constructor() {
        super();
        this.clear();
        this._nullElement = new Element(this);
    }

    clear(eid?: string) {
        this._datasources = eid === undefined ? [emptyDatabomb] : this._datasources;
        this._elements = eid === undefined ? [] : this._elements.filter(d => d.id() !== eid);
    }

    private _hookSend: IOptionsSend;
    hookSend(): IOptionsSend;
    hookSend(_: IOptionsSend): this;
    hookSend(_?: IOptionsSend): IOptionsSend | this {
        if (!arguments.length) return this._hookSend;
        this._hookSend = _;
        return this;
    }

    datasources(): DatasourceRefType[];
    datasources(_: DatasourceRefType[]): this;
    datasources(_?: DatasourceRefType[]): DatasourceRefType[] | this {
        if (!arguments.length) return this._datasources;
        this._datasources = _;
        return this;
    }

    datasource(id): DatasourceRefType {
        return this._datasources.filter(ds => ds.id() === id)[0];
    }

    appendDatasource(ds: DatasourceRefType): this {
        this._datasources.push(ds);
        return this;
    }

    removeDatasource(ds: DatasourceRefType): this {
        this._datasources = this._datasources.filter(row => row !== ds);
        return this;
    }

    elements(): Element[] {
        return [...this._elements];
    }

    element(w: string | PropertyExt | VizChartPanel): Element {
        let retVal: Element[];
        if (typeof w === "string") {
            retVal = this._elements.filter(viz => viz.id() === w);
        } else if (w instanceof VizChartPanel) {
            retVal = this._elements.filter(v => v.chartPanel() === w);
        } else {
            retVal = this._elements.filter(v => v.vizProps() === w);
        }
        if (retVal.length) {
            return retVal[0];
        }
        return this._nullElement;
    }

    elementExists(w: string | PropertyExt): boolean {
        return this.element(w) !== this._nullElement;
    }

    elementIDs() {
        return this._elements.map(viz => viz.id());
    }

    append(element: Element): this {
        this._elements.push(element);
        return this;
    }

    filteredBy(elemID: string): Element[] {
        return this._elements.filter(otherViz => {
            const filterIDs = otherViz.updatedBy();
            return filterIDs.indexOf(elemID) >= 0;
        });
    }

    views(): HipiePipeline[] {
        return this._elements.map(viz => viz.hipiePipeline());
    }

    view(id: string): HipiePipeline | undefined {
        return this.views().filter(view => view.id() === id)[0];
    }

    normalizePersist(seri: any): { [key: string]: { [key: string]: any } } {
        const ret = {};
        seri.__properties.content.map((n) => {
            const _is_MegaChart = !!n.__properties.widget.__properties.chart;
            const _cell = n;
            const _panel = n.__properties.widget;
            const _widget = _is_MegaChart ? n.__properties.widget.__properties.chart : n.__properties.widget.__properties.widget;
            const _id = n.__properties.widget.__id ? n.__properties.widget.__id : n.__properties.widget.__properties.widget.__id;
            ret[_id] = {
                id: _id,
                package: _widget.__class.split("_")[0],
                object: _widget.__class.split("_")[1],
                cell: _get_params(_cell, ["chart", "widget", "fields"]),
                panel: _get_params(_panel, ["chart", "widget", "fields"]),
                widget: _get_params(_widget, ["fields"])
            };
        });
        return ret;
        function _get_params(_o, exclude_list) {
            const ret = {};
            Object.keys(_o.__properties)
                .filter(n => exclude_list.indexOf(n) === -1)
                .forEach(n => ret[n] = _o.__properties[n]);
            return ret;
        }
    }

    validate(): IElementError[] {
        let retVal: IElementError[] = [];
        this._elements.forEach(elem => {
            retVal = retVal.concat(elem.validate());
        });
        return retVal;
    }

    refresh(): Promise<this> {
        return Promise.all(this.elements().map(element => element.refresh())).then(() => {
            return this;
        });
    }

    //  Events  ---
    vizStateChanged(viz: Element) {
    }
}
ElementContainer.prototype._class += " dashboard_ElementContainer";

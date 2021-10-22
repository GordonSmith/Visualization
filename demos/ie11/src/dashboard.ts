import { DockPanel } from "@hpcc-js/phosphor";
import { MainGraph, MainSankey } from "./graph";
import { CompanyTable, PersonTable } from "./table";
import { DataEditor, DataWrangler, RawDataT } from "./data";

//  Dock Panel ---
export class Dashboard extends DockPanel {

    protected _data = new DataWrangler();
    protected _mainGraph = new MainGraph();
    protected _mainSankey = new MainSankey();
    protected _companyTable = new CompanyTable();
    protected _personTable = new PersonTable();
    protected _dataEditor = new DataEditor();

    constructor(target: string) {
        super();

        this
            .target(target)
            .addWidget(this._mainGraph, "Graph")
            .addWidget(this._companyTable, "Companies", "split-bottom", this._mainGraph)
            .addWidget(this._mainSankey, "Sankey", "tab-after", this._mainGraph)
            .addWidget(this._personTable, "People", "tab-after", this._companyTable)
            .addWidget(this._dataEditor, "Data (paste here!!!)", "tab-after", this._personTable)
            .render()
            ;

        this._dataEditor.on("changes", () => {
            this.loadData(this._dataEditor.json() as any);
        });
    }

    loadData(data: RawDataT) {
        this._data.load(data);

        this._companyTable
            .loadData(this._data.companies())
            ;

        this._personTable
            .loadData(this._data.people())
            ;

        this._mainGraph.resetLayout();
        this._mainGraph
            .loadData(this._data.vertices(), this._data.edges())
            ;

        this._mainSankey
            .loadData(this._data.vertices(), this._data.edges())
            ;

        this.lazyRender();
    }
}


import { DockPanel } from "@hpcc-js/phosphor";
import { MainGraph, MainSankey } from "./graph";
import { Company, Person, CompanyTable, PersonTable } from "./table";
import { DataEditor } from "./editor";
import { fetchCompanies, fetchGraph, fetchPeople, rawData, RawDataT } from "../server";

//  Dock Panel ---
export class Dashboard extends DockPanel {

    // protected _data = new DataWrangler();
    protected _mainGraph = new MainGraph()
        .on("vertex_dblclick", (row, col, sel) => {
            this.fetchGraph(row.id);
        })
        ;

    protected _mainSankey = new MainSankey()
        .on("dblclick", (row, col, sel) => {
            this.fetchGraph(row.id);
        })
        ;

    protected _companyTable = new CompanyTable()
        .on("click", () => this.tableSelection(this._companyTable.selection()))
        ;

    protected _personTable = new PersonTable()
        .on("click", () => this.tableSelection(this._personTable.selection()))
        ;

    protected _dataEditor = new DataEditor().json(rawData());

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
            rawData(this._dataEditor.json() as RawDataT);
            this.reset();
        });
    }

    reset() {
        fetchCompanies().then(companies => {
            this._companyTable
                .loadData(companies.map((row): Company => {
                    return [row.name, row.payload.duns, [[row.payload.address?.addressCountry?.name, row.payload.address?.addressLocality?.name, row.payload.address?.postalCode]], row.payload.directOwnershipPercentage, row.payload.impliedDirectOwnershipPercentage, row];
                }))
                ;
        });

        fetchPeople().then(people => {
            this._personTable
                .loadData(people.map((row): Person => {
                    return [row.name, [[row.payload.address?.addressCountry?.name, row.payload.address?.addressLocality?.name, row.payload.address?.postalCode]], row.payload.directOwnershipPercentage, row.payload.impliedDirectOwnershipPercentage, row];
                }));
        });

        this._mainGraph.resetLayout();
        fetchGraph().then(graph => {
            this._mainGraph
                .loadData(graph.vertices, graph.edges)
                ;

            this._mainSankey
                .loadData(graph.vertices, graph.edges)
                ;

            this.lazyRender();
        });
    }

    fetchGraph(id: number) {
        fetchGraph(id, 1).then(graph => {
            this._mainGraph
                .mergeData(graph.vertices, graph.edges)
                .resetLayout()
                .lazyRender()
                ;
            this._mainSankey
                .mergeData(graph.vertices, graph.edges)
                .lazyRender()
                ;
        });
    }

    tableSelection(selection: any) {
        if (selection.length) {
            this._mainGraph
                .selection([selection[0].__lparam])
                .centerOnItem(selection[0].__lparam.id)
                ;
        }
    }
}

import { DockPanel } from "@hpcc-js/phosphor";
import { JSONEditor } from "@hpcc-js/codemirror";
import { MainGraph, MainSankey } from "./graph";
import { Company, Person, CompanyTable, PersonTable } from "./table";
import { fetchCompanies, fetchGraph, fetchPeople, rawData, RawDataT } from "../server";

//  Dock Panel ---
export class Dashboard extends DockPanel {

    // protected _data = new DataWrangler();
    protected _mainGraph = new MainGraph()
        .on("vertex_click", (row, col, sel) => {
            this.graphSelection(this._mainGraph.selection());
        })
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

    protected _dataEditor = new JSONEditor().json(rawData());

    protected _propsEditor = new JSONEditor()
        .readOnly(true)
        .json({})
        ;

    constructor(target: string) {
        super();

        this._mainGraph._contractButton
            .on("click", () => {
                const vertexIdx = {};
                this._mainGraph.edges().forEach(row => {
                    const origData: any = row[row.length - 1];
                    if (vertexIdx[origData.sourceID] === undefined) {
                        vertexIdx[origData.sourceID] = 0;
                    }
                    ++vertexIdx[origData.sourceID];

                    if (vertexIdx[origData.targetID] === undefined) {
                        vertexIdx[origData.targetID] = 0;
                    }
                    ++vertexIdx[origData.targetID];
                });

                const removed = {};
                this._mainGraph.vertices(this._mainGraph.vertices().filter((row => {
                    const origData: any = row[row.length - 1];
                    if (vertexIdx[origData.id] === 1 && origData?.neighbors?.total === 1) {
                        vertexIdx[origData.id] = 0;
                        return false;
                    }
                    return true;
                })));
                this._mainGraph.edges(this._mainGraph.edges().filter((row => {
                    const origData: any = row[row.length - 1];
                    return !(removed[origData?.sourceID] === 0 || removed[origData?.targetID] === 0);
                })));
                this._mainGraph.lazyRender();
            });

        this._mainGraph._expandButton
            .on("click", () => {
                this._mainGraph.selection().forEach(async row => {
                    await this.fetchGraph(row.origData.id);
                });
            });

        this
            .target(target)
            .addWidget(this._mainGraph, "Graph")
            .addWidget(this._companyTable, "Companies", "split-bottom", this._mainGraph)
            .addWidget(this._mainSankey, "Sankey", "tab-after", this._mainGraph)
            .addWidget(this._personTable, "People", "tab-after", this._companyTable)
            .addWidget(this._dataEditor, "Data (paste here!!!)", "tab-after", this._personTable)
            .addWidget(this._propsEditor, "Selected Details", "split-right", this._personTable)
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
                    return [row.neighbors?.total || 0, row.name, row.payload.duns, [[row.payload.address?.addressCountry?.name, row.payload.address?.addressLocality?.name, row.payload.address?.postalCode]], row.payload.directOwnershipPercentage, row.payload.impliedDirectOwnershipPercentage, row];
                }))
                ;
        });

        fetchPeople().then(people => {
            this._personTable
                .loadData(people.map((row): Person => {
                    return [row.neighbors?.total || 0, row.name, [[row.payload.address?.addressCountry?.name, row.payload.address?.addressLocality?.name, row.payload.address?.postalCode]], row.payload.directOwnershipPercentage, row.payload.impliedDirectOwnershipPercentage, row];
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
        return fetchGraph(id, 1).then(graph => {
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

    //  Selection  ---
    graphSelection(selection: any) {
        this._propsEditor
            .json(selection.map(row => row.origData?.payload?.payload))
            .lazyRender()
            ;
    }

    tableSelection(selection: any) {
        if (selection.length) {
            this._mainGraph
                .selection([selection[0].__lparam])
                .centerOnItem(selection[0].__lparam.id)
                ;
        }
        this._propsEditor
            .json(selection.map(row => row.__lparam))
            .lazyRender()
            ;
    }
}

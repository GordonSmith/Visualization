import { Table } from "@hpcc-js/dgrid";

export type Address = [string, string, string];
export type Company = [number, string, string, Address[], number, number, any];
export type Person = [number, string, Address[], number, number, any];

export class CompanyTable extends Table {

    constructor() {
        super();
        this.columns(["Neighbours", "Name", "Duns", { label: "Address", columns: ["Country", "Locality", "Region", "PostalCode"] }, "Direct Ownership", "Implied Ownership"]);
    }

    loadData(data: Company[]) {
        this.data(data);
        return this;
    }
}

export class PersonTable extends Table {

    constructor() {
        super();
        this.columns(["Neighbours", "Name", { label: "Address", columns: ["Country", "Locality", "Region", "PostalCode"] }, "Direct Ownership", "Implied Ownership"]);
    }

    loadData(data: Person[]) {
        this.data(data);
        return this;
    }
}


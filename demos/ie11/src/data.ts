import { JSONEditor } from "@hpcc-js/codemirror";
import { Edge, Vertex } from "./graph";
import { rawData } from "./rawData";
import { Company, Person } from "./table";

export type RawDataT = typeof rawData;

export function fetchData(): Promise<RawDataT> {
    return Promise.resolve(rawData);
}

export class DataWrangler {

    protected _rawData: RawDataT;

    constructor() {
    }

    load(rawData: RawDataT) {
        this._rawData = rawData;
    }

    companies(): Company[] {
        return (this._rawData?.organization?.beneficialOwnership?.beneficialOwners || [])
            .filter(row => !!row.duns)
            .map((row): Company => {
                return [row.name, row.duns, [[row.address?.addressCountry?.name, row.address?.addressLocality?.name, row.address?.postalCode]], row.directOwnershipPercentage, row.impliedDirectOwnershipPercentage, row];
            });
    }

    people(): Person[] {
        return (this._rawData?.organization?.beneficialOwnership?.beneficialOwners || [])
            .filter(row => !!!row.duns)
            .map((row): Person => {
                return [row.name, [[row.address?.addressCountry?.name, row.address?.addressLocality?.name, row.address?.postalCode]], row.directOwnershipPercentage, row.impliedDirectOwnershipPercentage, row];
            });
    }

    vertices(): Vertex[] {
        return (this._rawData?.organization?.beneficialOwnership?.beneficialOwners || [])
            .map((row): Vertex => {
                return {
                    type: !!row.duns ? "company" : "person",
                    id: row.memberID,
                    name: row.name,
                    payload: row
                };
            });
    }
    edges(): Edge[] {
        return (this._rawData?.organization?.beneficialOwnership?.relationships || [])
            .map((row): Edge => {
                return {
                    id: row.relationshipID,
                    sourceID: row.sourceMemberID,
                    targetID: row.targetMemberID,
                    weight: row.sharePercentage ?? 0,
                    payload: row
                };
            });
    }
}

export class DataEditor extends JSONEditor {
    constructor() {
        super();
    }
}

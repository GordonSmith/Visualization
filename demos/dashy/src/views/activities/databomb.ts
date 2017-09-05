import { IField } from "@hpcc-js/dgrid";
import { View } from "../view";
import { Activity } from "./activity";

export class Databomb extends Activity {
    _owner: View;

    constructor(owner: View) {
        super();
        this._owner = owner;
    }

    hash(more: object): string {
        return super.hash({
            payload: this.payload(),
            ...more
        });
    }

    refreshMeta(): Promise<void> {
        return Promise.resolve();
    }

    label(): string {
        return `Databomb`;
    }

    outFields(): IField[] {
        for (const row0 of this.payload()) {
            const retVal: IField[] = [];
            for (const key in row0) {
                retVal.push(
                    {
                        id: key,
                        label: key,
                        type: typeof row0[key],
                        children: null
                    });
            }
            return retVal;
        }
        return [];
    }

    exec(): Promise<void> {
        return Promise.resolve();
    }

    pullData(): object[] {
        return this.payload();
    }

    //  ===
    total(): number {
        return this.payload().length;
    }
}
Databomb.prototype._class += " Filters";
export interface Databomb {
    payload(): Array<{ [key: string]: any }>;
    payload(_: Array<{ [key: string]: any }>): this;
}
Databomb.prototype.publish("payload", [], "array", "ESP Url (http://x.x.x.x:8010)");
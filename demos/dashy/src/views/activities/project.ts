import { PropertyExt, publish } from "@hpcc-js/common";
import { IField } from "@hpcc-js/dgrid";
import { hashSum } from "@hpcc-js/util";
import { deviation as d3Deviation, max as d3Max, mean as d3Mean, median as d3Median, min as d3Min, sum as d3Sum, variance as d3Variance } from "d3-array";
import { nest as d3Nest } from "d3-collection";
import { View } from "../view";
import { Activity } from "./activity";

export type ComputedType = "=" | "*" | "/" | "+" | "-" | "scale";
export class ComputedField extends PropertyExt {
    private _owner: Project;

    @publish(null, "string", "Label", null, { optional: true })
    label: publish<this, string>;
    @publish("mapping", "set", "Project type", ["=", "*", "/", "+", "-", "scale"], { optional: true, disable: w => !w.label() })
    type: publish<this, ComputedType>;
    @publish(null, "set", "Param 1", function (this: ComputedField) { return this.columns(); }, { optional: false, disable: w => !w.label() })
    column1: publish<this, string>;
    @publish(null, "set", "Param 2", function (this: ComputedField) { return this.columns(); }, { optional: true, disable: (w: ComputedField) => !w.label() || ["*", "/", "+", "-"].indexOf(w.type()) < 0 })
    column2: publish<this, string>;
    @publish(null, "number", "Const value", null, { optional: true, disable: (w: ComputedField) => !w.label() || ["scale"].indexOf(w.type()) < 0 })
    constValue: publish<this, number>;

    constructor(owner: Project) {
        super();
        this._owner = owner;
    }

    hash(): string {
        return hashSum({
            label: this.label(),
            type: this.type(),
            column1: this.column1(),
            column2: this.column2(),
            constValue: this.constValue(),
        });
    }

    columns() {
        return this._owner.fieldIDs();
    }

    compute(row: any): any {
        switch (this.type()) {
            case "*":
                return +row[this.column1()] * +row[this.column2()];
            case "/":
                return +row[this.column1()] / +row[this.column2()];
            case "+":
                return +row[this.column1()] + +row[this.column2()];
            case "-":
                return +row[this.column1()] - +row[this.column2()];
            case "scale":
                return +row[this.column1()] * this.constValue();
            case "=":
            default:
                return row[this.column1()];
        }
    }
}
ComputedField.prototype._class += " AggregateField";
//  ===========================================================================
export class Project extends Activity {
    private _owner: View;

    @publish([], "propertyArray", "Computed Fields", null, { autoExpand: ComputedField })
    computedFields: publish<this, ComputedField[]>;
    @publish(false, "boolean", "trim", null, { autoExpand: ComputedField })
    trim: publish<this, boolean>;

    constructor(owner: View) {
        super();
        this._owner = owner;
    }

    hash(): string {
        return hashSum({
            computedFields: this.computedFields().map(cf => cf.hash()),
        });
    }

    exists(): boolean {
        return this.validComputedFields().length > 0;
    }

    fieldIDs(): string[] {
        return this.inFields().map(field => field.id);
    }

    field(fieldID: string): IField | null {
        for (const field of this.inFields()) {
            if (field.id === fieldID) {
                return field;
            }
        }
        return null;
    }

    appendComputedFields(computedFields: [{ label: string, type: ComputedType, column?: string }]): this {
        for (const aggregateField of computedFields) {
            const aggrField = new ComputedField(this)
                .label(aggregateField.label)
                .type(aggregateField.type)
                ;
            if (aggregateField.column !== void 0) {
                aggrField.column1(aggregateField.column);
            }
            this.computedFields().push(aggrField);
        }
        return this;
    }

    validComputedFields() {
        return this.computedFields().filter(computedField => computedField.label());
    }

    hasComputedFields() {
        return this.validComputedFields().length;
    }

    outFields(): IField[] {
        if (!this.exists()) return super.outFields();
        const retVal: IField[] = [];
        for (const cf of this.computedFields()) {
            if (cf.label()) {
                const computedField: IField = {
                    id: cf.label(),
                    label: cf.label(),
                    type: "string",
                    children: null
                };
                retVal.push(computedField);
            }
        }
        return this.trim() ? retVal : retVal.concat(super.outFields());
    }

    pullData(): object[] {
        const data = super.pullData();
        if (data.length === 0) return data;
        return data.map((row: any) => {
            const retVal = this.trim() ? {} : row;
            for (const cf of this.computedFields()) {
                if (cf.label()) {
                    retVal[cf.label()] = cf.compute(row);
                }
            }
            return retVal;
        });
    }
}
Project.prototype._class += " Project";

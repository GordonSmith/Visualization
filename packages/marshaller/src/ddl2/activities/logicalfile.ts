import { publish } from "../../publish.ts";
import { Result } from "@hpcc-js/comms";
import { DDL2 } from "@hpcc-js/ddl-shim";
import { ElementContainer } from "../model/element.ts";
import { ESPResult } from "./wuresult.ts";

export class LogicalFile extends ESPResult {

    declare url: publish<this, string>;
    declare logicalFile: publish<this, string>;

    constructor(_ec: ElementContainer) {
        super(_ec);
    }

    toDDL(): DDL2.ILogicalFile {
        return {
            type: "logicalfile",
            id: this.id(),
            url: this.url(),
            logicalFile: this.logicalFile(),
            fields: this.responseFields()
        };
    }

    fromDDL(ddl: DDL2.ILogicalFile): this {
        return this
            .id(ddl.id)
            .url(ddl.url)
            .logicalFile(ddl.logicalFile)
            ;
    }

    static fromDDL(ec: ElementContainer, ddl: DDL2.ILogicalFile): LogicalFile {
        return new LogicalFile(ec).fromDDL(ddl);
    }

    _createResult(): Result {
        return Result.attachLogicalFile({ baseUrl: this.url(), hookSend: this._ec.hookSend() }, "", this.logicalFile());
    }

    sourceHash(): string {
        return super.hash({
            logicalFile: this.logicalFile()
        });
    }

    hash(more: object): string {
        return super.hash({
            ddl: this.toDDL()
        });
    }

    label(): string {
        return `${this.logicalFile()}`;
    }
}
LogicalFile.prototype._class += " LogicalFile";


LogicalFile.prototype.publish("url", "", "string", "ESP Url (http://x.x.x.x:8010)");
LogicalFile.prototype.publish("logicalFile", "", "string", "Logical File Name");
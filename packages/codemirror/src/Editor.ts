import { CodeMirror } from "@hpcc-js/codemirror-shim";
import { HTMLWidget } from "@hpcc-js/common";

import "../src/Editor.css";

export interface IPosition {
    line: number;
    ch: number;
}

export class Editor extends HTMLWidget {
    private _codemirror: CodeMirror.EditorFromTextArea;
    private _markedText = [];
    protected _initialText: string = "";

    options(): any {
        return {
            readOnly: this.readOnly(),
            lineNumbers: true,
            tabSize: 2
        };
    }

    hasFocus(): boolean {
        return this._codemirror.hasFocus();
    }

    text(): string;
    text(_: string): this;
    text(_?: string): string | this {
        if (this._codemirror) {
            const doc = this._codemirror.getDoc();
            if (!arguments.length) return doc.getValue();
            doc.setValue(_);
            return this;
        }
        if (!arguments.length) return this._initialText;
        this._initialText = _;
        return this;
    }

    highlight(start: IPosition | number, end: IPosition | number, className = "cm-marked-text"): this {
        if (typeof start === "number") start = this.positionAt(start);
        if (typeof end === "number") end = this.positionAt(end);
        if (this._codemirror) {
            this._markedText.push(this._codemirror.markText(start, end, { className }));
        }
        return this;
    }

    highlightInfo(start: IPosition | number, end: IPosition | number): this {
        this.highlight(start, end, "cm-marked-info");
        return this;
    }

    highlightWarning(start: IPosition | number, end: IPosition | number): this {
        this.highlight(start, end, "cm-marked-warning");
        return this;
    }

    highlightError(start: IPosition | number, end: IPosition | number): this {
        this.highlight(start, end, "cm-marked-error");
        return this;
    }

    removeAllHighlight(): this {
        for (const marked of this._markedText) {
            marked.clear();
        }
        this._markedText = [];
        return this;
    }

    positionAt(i: number): IPosition {
        return this._codemirror.posFromIndex(i);
    }

    highlightSubstring(str: string) {
        const splitTextArr = this.text().split(str).slice(0, -1);
        let idx = 0;
        splitTextArr.forEach(splitText => {
            idx += splitText.length;
            this.highlight(
                this.positionAt(idx),
                this.positionAt(idx + str.length)
            );
            idx += str.length;
        });
    }

    setCursor(row: number, col: number, focus = true) {
        this._codemirror.setCursor(row, col);
        if (focus) {
            setTimeout(() => {
                this._codemirror.focus();
            }, 0);
        }
    }

    enter(domNode, element) {
        super.enter(domNode, element);
        this._codemirror = CodeMirror.fromTextArea(element.append("textarea").node(), this.options());
        this._codemirror.on("changes", (cm: CodeMirror.EditorFromTextArea, changes: object[]) => {
            this.changes(changes);
        });
        this.text(this._initialText);
    }

    update(domNode, Element) {
        super.update(domNode, Element);
        this._codemirror.setOption("readOnly", this.readOnly());
        this._codemirror.setSize(this.width() - 2, this.height() - 2);
        this._codemirror.refresh();
    }

    //  Events  ---
    changes(changes: object[]) {
    }
}
Editor.prototype._class += " codemirror_Editor";

export interface Editor {
    readOnly(): boolean;
    readOnly(_: boolean): this;
}
Editor.prototype.publish("readOnly", false, "boolean", "If true, the contents will be uneditable");

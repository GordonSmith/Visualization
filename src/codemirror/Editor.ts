import * as cm from "codemirror";
import { HTMLWidget } from "../common/HTMLWidget";

import "codemirror/lib/codemirror.css";
import "./Editor.css";

export class Editor extends HTMLWidget {
    protected _codemirror: cm.EditorFromTextArea;
    protected _initialText: string = "";

    options(): any {
        return {
            lineNumbers: true,
            tabSize: 2
        };
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

    enter(domNode, element) {
        super.enter(domNode, element);
        this._codemirror = cm.fromTextArea(element.append("textarea").node(), this.options());
        this.text(this._initialText);
    }

    update(domNode, Element) {
        super.update(domNode, Element);
        this._codemirror.setSize(this.width(), this.height() - 3);
        this._codemirror.refresh();
    }
}
Editor.prototype._class += " codemirror_Editor";

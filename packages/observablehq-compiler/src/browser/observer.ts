import type { ohq } from "@hpcc-js/observable-shim/dist/parser";
import { Inspector } from "@hpcc-js/observable-shim/dist/inspector";

export { Inspector as Observer };

export class NullObserver implements ohq.Inspector {
    pending() {
    }
    fulfilled(value: any) {
    }
    rejected(error: any) {
    }
}
export const nullObserver = new NullObserver();

export const nullObserverFactory: ohq.InspectorFactory = (name?: string) => nullObserver;

export class HookedObserver extends NullObserver {

    private _inspector: ohq.Inspector;
    private _callback: ohq.Inspector;

    constructor(private _element: HTMLElement, callback: ohq.Inspector) {
        super();
        this._inspector = new Inspector(this._element);
        this._callback = callback;
    }

    pending() {
        this._callback.pending();
        this._inspector.pending();
    }

    fulfilled(value: any) {
        this._callback.fulfilled(value);
        this._inspector.fulfilled(value);
    }

    rejected(error: any) {
        this._callback.rejected(error);
        this._inspector.rejected(error);
    }
}

export function createHookedObserverFactory(element: HTMLElement, callback: ohq.Inspector = nullObserver) {
    return (name: string) => {
        const div = document.createElement("div");
        element.appendChild(div);
        return new HookedObserver(div, callback);
    };
}
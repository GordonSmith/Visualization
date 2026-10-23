interface SharedState<T extends Disposable> {
    value: T;
    references: number;
    active: boolean;
}

/**
 * A C++ `std::shared_ptr` style owner.  Every owner (created with `copy()`) keeps the resource
 * alive; the resource is disposed exactly once, when the final owner is disposed.
 */
export class SharedPtr<T extends Disposable> {
    private _state: SharedState<T> | undefined;

    constructor(value: T) {
        this._state = { value, references: 1, active: true };
    }

    /** Constructs a disposable resource and takes ownership of it. */
    static make<T extends Disposable, Args extends unknown[]>(ctor: new (...args: Args) => T, ...args: Args): SharedPtr<T> {
        return new SharedPtr(new ctor(...args));
    }

    /** The resource, or `undefined` once this owner has been disposed. */
    get(): T | undefined {
        return this._state?.active ? this._state.value : undefined;
    }

    /** Creates another owner of the same resource. */
    copy(): SharedPtr<T> {
        const owner = Object.create(SharedPtr.prototype) as SharedPtr<T>;
        const state = this._state;
        if (!state?.active) return owner;

        ++state.references;
        owner._state = state;
        return owner;
    }

    /** Releases this owner.  Disposing the final owner disposes the resource. */
    dispose(): void {
        const state = this._state;
        this._state = undefined;
        if (!state?.active) return;

        if (--state.references === 0) {
            state.active = false;
            state.value[Symbol.dispose]();
        }
    }

    /** Enables `using owner = ptr.copy()`. */
    [Symbol.dispose](): void {
        this.dispose();
    }
}

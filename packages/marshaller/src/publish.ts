/**
 * Type helper for dynamically published properties.
 * Published properties act as getter/setter methods at runtime.
 */
export type publish<_This, T> = {
    (): T;
    (_: T): _This;
};

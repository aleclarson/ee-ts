declare type Id<T> = T;
declare type In<T> = T extends (...args: infer U) => any ? U : [];
declare type Out<T> = T extends (...args: any[]) => infer U ? U : never;
declare type Filter<T, Cond, U extends keyof T = keyof T> = {
    [K in U]: T[K] extends Cond ? K : never;
}[U];
declare type EventKey<T> = Filter<T, (...args: any[]) => any> & string;
declare type EventIn<T, K extends EventKey<T>> = Id<In<T[K]>>;
declare type EventOut<T, K extends EventKey<T>> = Id<Out<T[K]> | void>;
/** Extract the listener type for a specific event */
export declare type Listener<T, K extends EventKey<T> = EventKey<T>> = Id<(...args: EventIn<T, K>) => EventOut<T, K>>;
/** An object of event keys and listener values */
export declare type ListenerMap<T> = Partial<{
    [K in EventKey<T>]: Listener<T, K>;
}>;
/** Statically typed event emitter */
export declare class EventEmitter<T> {
    constructor();
    /** Unique symbol for accessing the internal listener cache */
    static readonly ev: any;
    /** Count the number of listeners for an event */
    static count<T>(ee: EventEmitter<T>, key: EventKey<T>): number;
    /** Check if an event has listeners */
    static has<T>(ee: EventEmitter<T>, key: '*' | EventKey<T>): boolean;
    /** Get an array of event keys that have listeners */
    static keys<T>(ee: EventEmitter<T>): Array<EventKey<T>>;
    /** Call the given listener when no other listeners exist */
    static unhandle<T, K extends EventKey<T>>(ee: EventEmitter<T>, key: K, fn: Listener<T, K>): typeof fn;
    /** Add a recurring listener */
    on<K extends EventKey<T>>(key: K, fn: Listener<T, K>): typeof fn;
    /** Add many recurring listeners */
    on(map: ListenerMap<T>): this;
    /** Add a one-time listener */
    one<K extends EventKey<T>>(key: K, fn: Listener<T, K>): typeof fn;
    /** Add many one-time listeners */
    one(map: ListenerMap<T>): this;
    /** Remove one or all listeners of an event */
    off<K extends EventKey<T>>(key: K, fn?: Listener<T, K>): this;
    /** Remove all listeners from all events */
    off(key: '*'): this;
    /** Call the listeners of an event */
    emit<K extends EventKey<T>>(key: K, ...args: EventIn<T, K>): EventOut<T, K>;
    /** Iterate over the listeners of an event */
    listeners<K extends EventKey<T>>(key: K): IterableIterator<Listener<T, K>>;
    /** Called when an event goes from 0 -> 1 listeners */
    protected _onEventHandled?(key: string): void;
    /** Called when an event goes from 1 -> 0 listeners */
    protected _onEventUnhandled?(key: string): void;
}
export {};

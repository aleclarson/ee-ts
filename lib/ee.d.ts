declare type AnyFunction = (...args: any[]) => any;
/** Extract an array type from the argument list of a function type */
export declare type ArgList<T> = T extends (...args: infer U) => any ? U : [];
/** Extract the listener type for a specific event type */
export declare type Listener<Events, T extends keyof Events = keyof Events, U = Events[T]> = (...args: ArgList<U>) => U extends AnyFunction ? ReturnType<U> | void : any;
/** An object where the keys are event types and values are listeners */
export declare type ListenerMap<Events> = {
    [T in keyof Events]?: Listener<Events, T>;
};
/** Statically typed event emitter */
export declare class EventEmitter<Events> {
    constructor();
    /** Unique symbol for accessing the internal listener cache */
    static readonly ev: any;
    /** Count the number of listeners for an event */
    static count<Events>(ee: EventEmitter<Events>, type: keyof Events): number;
    /** Check if an event has listeners */
    static has<Events>(ee: EventEmitter<Events>, type: '*' | keyof Events): boolean;
    /** Get an array of event types that have listeners */
    static keys<Events>(ee: EventEmitter<Events>): Array<keyof Events>;
    /** Call the given listener when no other listeners exist */
    static unhandle<Events, T extends keyof Events>(ee: EventEmitter<Events>, type: T, fn: Listener<Events, T>): typeof fn;
    /** Add many recurring listeners */
    on(map: ListenerMap<Events>): this;
    /** Add a recurring listener */
    on<T extends keyof Events, U extends Listener<Events, T>>(type: T, fn: U): U;
    /** Add many one-time listeners */
    one(map: ListenerMap<Events>): this;
    /** Add a one-time listener */
    one<T extends keyof Events>(type: T, fn: Listener<Events, T>): typeof fn;
    /** Remove all listeners from all events */
    off(type: '*'): this;
    /** Remove one or all listeners of an event */
    off<T extends keyof Events>(type: T, fn?: Listener<Events, T>): this;
    /** Call the listeners of an event */
    emit<T extends keyof Events>(type: T, ...args: ArgList<Events[T]>): Events[T] extends AnyFunction ? ReturnType<Events[T]> | void : any;
    /** Iterate over the listeners of an event */
    listeners<T extends keyof Events>(type: T): IterableIterator<Listener<Events, T>>;
    /** Called when an event goes from 0 -> 1 listeners */
    protected _onEventHandled?<T extends keyof Events>(type: T): void;
    /** Called when an event goes from 1 -> 0 listeners */
    protected _onEventUnhandled?<T extends keyof Events>(type: T): void;
}
export {};

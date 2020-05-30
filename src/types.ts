// Human-readable generic types
type Id<T> = T

// Extract the argument/return types of a function
type In<T> = T extends (...args: infer U) => any ? U : []
type Out<T> = T extends (...args: any[]) => infer U ? U : never

// Extract keys whose values match a condition
type Filter<T, Cond, U extends keyof T = keyof T> = {
  [K in U]: T[K] extends Cond ? K : never
}[U]

// Extract an array type of valid event keys
export type EventKey<T> = Filter<T, (...args: any[]) => any> & string

// Extract the argument/return types of a valid event
export type EventIn<T, K extends EventKey<T>> = Id<In<T[K]>>
export type EventOut<T, K extends EventKey<T>> = Id<Out<T[K]> | void>

/** An object that needs to be manually disposed of */
export interface Disposable {
  dispose(): void
}

/** Extract the listener type for a specific event */
export type Listener<T, K extends EventKey<T> = EventKey<T>> = Id<
  (...args: EventIn<T, K>) => EventOut<T, K>
>

/** An object of event keys and listener values */
export type ListenerMap<T> = Partial<{ [K in EventKey<T>]: Listener<T, K> }>

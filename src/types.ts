// Extract the argument/return types of a function
type In<T> = T extends (...args: infer U) => any ? U : any[]

// Extract keys whose values match a condition
type Filter<T, Cond, U extends keyof T = keyof T> = {
  [K in U]: T[K] extends Cond ? K : never
}[U]

export type Falsy = false | null | undefined

/** Extract an array type of valid event keys */
export type EventKey<T> = '*' | Filter<T, (...args: any[]) => any> & string

/** Extract the argument/return types of a valid event */
export type EventArgs<T, K extends EventKey<T>> = K extends keyof T
  ? In<T[K]>
  : any[]

/** Extract the listener type for a specific event */
export type Listener<T = any, K extends EventKey<T> = EventKey<T>> = (
  ...args: EventArgs<T, K>
) => boolean | void

/** An object of event keys and listener values */
export type ListenerMap<T = any> = Partial<
  { [K in EventKey<T>]: Listener<T, K> | Falsy }
>

/** The internal cache of listeners by event key */
export type ListenerCache<T = any> = {
  [K in EventKey<T>]: Set<Listener<T, K>> | undefined
} & {
  [key: string]: Set<Listener> | undefined
}

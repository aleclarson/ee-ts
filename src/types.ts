import type { Falsy } from '@alloc/types'
import type { EventEmitter } from './ee'

// Extract the argument/return types of a function
export type In<T> = T extends (...args: infer U) => any ? U : unknown[]

/** Strongly typed event source */
export interface EventSource<T extends object = any>
  extends Omit<EventEmitter<T extends EventSource<infer U> ? U : T>, 'emit'> {}

/** Extract an array type of valid event keys */
export type EventKey<T> = 'emit' | (keyof T & string)

/** Extract the argument/return types of a valid event */
export type EventArgs<T, K extends string> = K extends 'emit'
  ? [string, unknown[]]
  : K extends keyof T & EventKey<T>
  ? In<T[K]>
  : unknown[]

/** Extract the listener type for a specific event */
export type Listener<T = any, K extends string = string> = (
  ...args: EventArgs<T, K>
) => boolean | void

/** An object of event keys and listener values */
export type ListenerMap<T = any> = Partial<{
  [K in EventKey<T>]: Listener<T, K> | Falsy
}>

/** The internal cache of listeners by event key */
export type ListenerCache<T = any> = {
  [K in EventKey<T>]: Set<Listener<T, K>> | undefined
} & {
  [key: string]: Set<Listener> | undefined
}

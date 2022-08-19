import { Any, Falsy, Intersect, Remap } from '@alloc/types'
import { EventEmitter as EE } from './ee'
import { In } from './types'

export const EventEmitter = EE as {
  new <T extends object = any>(): EventEmitter<T>
}

export type EventEmitter<Events extends object = any> = Remap<
  EventMethods<Events> &
    ListenerMethods<'emit', [key: string, args: unknown[]]> & {
      off(key: '*'): EventEmitter<Events>
    }
>

/**
 * Similar to `EventEmitter` but without an `emit` method.
 *
 * Useful for functions that need to listen for events but
 * don't need to emit any. Think of it like a readonly
 * event emitter.
 */
export type EventSource<Events extends object = any> = Omit<
  EventEmitter<Events>,
  'emit'
>

type EventMethods<Events extends object = any> = Intersect<
  keyof Events extends infer EventKey
    ? EventKey extends keyof Events & string
      ?
          | EmitMethod<EventKey, EventArgs<Events[EventKey]>>
          | ListenerMethods<EventKey, EventArgs<Events[EventKey]>>
      : never
    : never
>

type EventListener<Args extends readonly any[]> = (
  ...args: Args
) => boolean | void
type EventArgs<T> = [T] extends [Any]
  ? unknown[]
  : [T] extends [void]
  ? []
  : [T] extends [readonly any[]]
  ? T
  : In<T>

type EmitMethod<EventKey extends string, EventArgs extends readonly any[]> = {
  emit(key: EventKey, ...args: EventArgs): void
}

interface ListenerMethods<
  EventKey extends string,
  EventArgs extends readonly any[]
> {
  on<T extends EventListener<EventArgs> | Falsy>(key: EventKey, listener: T): T
  off(key: EventKey, listener?: EventListener<EventArgs>): this
}

export type {
  Listener,
  ListenerMap,
  ListenerCache,
  EventKey,
  EventArgs,
  EventSource,
} from './types'

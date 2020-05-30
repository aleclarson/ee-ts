import {
  Disposable,
  EventIn,
  EventKey,
  EventOut,
  IListener,
  IListenerList,
  Listener,
  ListenerMap,
} from './types'

export { Disposable, Listener, ListenerMap }

export const $listeners = Symbol('EventEmitter.listeners')
export const $addListener = Symbol('EventEmitter.addListener')

/** Statically typed event emitter */
export class EventEmitter<T> {
  [$listeners]: { [K in EventKey<T>]?: IListenerList<T, K> }

  constructor() {
    this[$listeners] = {}
  }

  /** Unique symbol for accessing the internal listener cache */
  static readonly ev = $listeners

  /** Count the number of listeners for an event */
  static count<T>(ee: EventEmitter<T>, key: EventKey<T>): number {
    let count = 0
    let list = ee[$listeners][key]
    if (list) {
      let cb = list.first
      while (++count) {
        if (cb.next) {
          cb = cb.next
        } else break
      }
    }
    return count
  }

  /** Check if an event has listeners */
  static has<T>(ee: EventEmitter<T>, key: '*' | EventKey<T>): boolean {
    if (key == '*') {
      for (key in ee[$listeners]) return true
      return false
    }
    return ee[$listeners][key] !== undefined
  }

  /** Get an array of event keys that have listeners */
  static keys<T>(ee: EventEmitter<T>): Array<EventKey<T>> {
    return Object.keys(ee[$listeners]) as any
  }

  /** Call the given listener when no other listeners exist */
  static unhandle<T, K extends EventKey<T>>(
    ee: EventEmitter<T>,
    key: K,
    impl: Listener<T, K>,
    disposables?: Disposable[]
  ): typeof impl {
    let listener: Listener<T, K> = (...args) => {
      if (!ee[$listeners][key]!.first.next) return impl(...args)
    }
    return ee.on(key, listener, disposables)
  }

  /** Add a recurring listener */
  on<K extends EventKey<T>>(
    key: K,
    fn: Listener<T, K>,
    disposables?: Disposable[]
  ): typeof fn

  /** Add many recurring listeners */
  on(map: ListenerMap<T>, disposables?: Disposable[]): this

  /** Implementation */
  on(
    arg: EventKey<T> | ListenerMap<T>,
    fn?: Listener<T> | Disposable[],
    disposables?: Disposable[]
  ): this | Listener<T> {
    if (typeof fn == 'function') {
      return this[$addListener](arg, fn, disposables)
    }
    return this[$addListener](arg, undefined, fn)
  }

  /** Add a one-time listener */
  one<K extends EventKey<T>>(key: K, fn: Listener<T, K>): typeof fn

  /** Add many one-time listeners */
  one(map: ListenerMap<T>): this

  /** Implementation */
  one(
    arg: EventKey<T> | ListenerMap<T>,
    fn?: Listener<T> | Disposable[],
    disposables?: Disposable[]
  ): this | Listener<T> {
    if (typeof fn == 'function') {
      return this[$addListener](arg, fn, disposables, true)
    }
    return this[$addListener](arg, undefined, fn, true)
  }

  /** Remove one or all listeners of an event */
  off<K extends EventKey<T>>(key: K, fn?: Listener<T, K>): this

  /** Remove all listeners from all events */
  off(key: '*'): this

  /** Implementation */
  off(arg: '*' | EventKey<T>, fn?: Listener<T>): this {
    if (arg == '*') {
      let cache = this[$listeners]
      this[$listeners] = {}
      if (this._onEventUnhandled) {
        for (let key in cache) {
          this._onEventUnhandled(key)
        }
      }
      return this
    }
    if (typeof fn == 'function') {
      let list = this[$listeners][arg]!
      if (list && unlink(list, l => l.fn == fn)) {
        return this
      }
    }
    delete this[$listeners][arg]
    if (this._onEventUnhandled) {
      this._onEventUnhandled(arg as string)
    }
    return this
  }

  /** Call the listeners of an event */
  emit<K extends EventKey<T>>(key: K, ...args: EventIn<T, K>): EventOut<T, K>

  /** Implementation */
  emit<K extends EventKey<T>>(key: K, ...args: EventIn<T, K>): any {
    let result
    let gen = this.listeners(key)
    while (true) {
      let { value: listener, done } = gen.next()
      if (done) {
        return result
      } else {
        let generated = listener(...args)
        if (generated !== undefined) {
          result = generated
        }
      }
    }
  }

  /** Iterate over the listeners of an event */
  *listeners<K extends EventKey<T>>(key: K): IterableIterator<Listener<T, K>> {
    let list = this[$listeners][key]
    if (!list) return

    let prev = null
    let curr = list.first
    while (true) {
      yield curr.fn

      // One-time listener
      if (curr.once) {
        // Splice it.
        if (prev) {
          prev.next = curr.next
        }
        // Shift it.
        else if (curr.next) {
          list.first = curr = curr.next
          continue
        }
        // Delete it.
        else {
          delete this[$listeners][key]
          if (this._onEventUnhandled) {
            this._onEventUnhandled(key as string)
          }
          return
        }
      }
      // Recurring listener
      else {
        prev = curr
      }

      // Continue to the next listener.
      if (curr.next) {
        curr = curr.next
        continue
      }

      // Update the last listener.
      list.last = curr

      // All done.
      return
    }
  }

  /** Called when an event goes from 0 -> 1 listeners */
  protected _onEventHandled?(key: string): void

  /** Called when an event goes from 1 -> 0 listeners */
  protected _onEventUnhandled?(key: string): void

  /** Implementation of the `on` and `one` methods */
  protected [$addListener](
    arg: EventKey<T> | ListenerMap<T>,
    fn?: Listener<T>,
    disposables?: Disposable[],
    once: boolean = false
  ): this | Listener<T> {
    if (typeof arg == 'object') {
      let key: EventKey<T>
      for (key in arg) {
        if (typeof arg[key] == 'function') {
          let fn = arg[key] as Listener<T>
          let list = addListener(this[$listeners], key as EventKey<T>, {
            fn,
            once,
            next: null,
          })
          if (disposables) {
            disposables.push({
              dispose: () => this.off(key, fn),
            })
          }
          if (fn == list.first.fn && this._onEventHandled) {
            this._onEventHandled(key)
          }
        }
      }
      return this
    }
    if (typeof fn == 'function') {
      let key = arg
      let list = addListener(this[$listeners], key, {
        fn,
        once,
        next: null,
      })
      if (disposables) {
        disposables.push({
          dispose: () => this.off(key, fn),
        })
      }
      if (fn == list.first.fn && this._onEventHandled) {
        this._onEventHandled(arg as string)
      }
    }
    return fn!
  }
}

function addListener<T>(
  cache: { [K in EventKey<T>]?: IListenerList<T, K> },
  key: EventKey<T>,
  cb: IListener<T>
): IListenerList<T> {
  let list = cache[key]
  if (list) {
    list.last.next = cb
    list.last = cb
  } else {
    cache[key] = list = { first: cb, last: cb }
  }
  return list!
}

/** Remove listeners that match the filter function */
function unlink<T>(
  list: IListenerList<T>,
  filter: (cb: IListener<T>) => boolean
): IListenerList<T> | null {
  let prev = null
  let curr = list.first
  while (true) {
    // Return true to unlink the listener.
    if (filter(curr)) {
      // Splice it.
      if (prev) {
        prev.next = curr.next
        if (curr.next) {
          curr = curr.next
        } else break
      }
      // Shift it.
      else if (curr.next) {
        list.first = curr = curr.next
      }
      // No listeners remain.
      else {
        return null
      }
    }
    // Keep this listener.
    else {
      prev = curr
      if (curr.next) {
        curr = curr.next
      } else break
    }
  }

  // At least one listener remains.
  list.last = prev
  return list
}

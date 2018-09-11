const ev = Symbol('EventEmitter.listeners')
const on = Symbol('EventEmitter.addListener')

type AnyFunction = (...args: any[]) => any

// Internal listener object
interface IListener<T> {
  fn: T
  once: boolean
  next: IListener<T> | null
}

// Singly linked list of listeners
type LinkedList<T> = {
  first: IListener<T>
  last: IListener<T>
}

/** Extract an array type from the argument list of a function type */
export type ArgList<T> = T extends (...args: infer U) => any ? U : []

/** Extract the listener type for a specific event type */
export type Listener<
  Events,
  T extends keyof Events = keyof Events,
  U = Events[T]
> = (...args: ArgList<U>) => U extends AnyFunction ? ReturnType<U> | void : any

/** An object where the keys are event types and values are listeners */
export type ListenerMap<Events> = { [T in keyof Events]?: Listener<Events, T> }

/** Statically typed event emitter */
export class EventEmitter<Events> {
  [ev]: { [T in keyof Events]?: LinkedList<Listener<Events, T>> }

  constructor() {
    this[ev] = {}
  }

  /** Unique symbol for accessing the internal listener cache */
  static readonly ev = ev

  /** Count the number of listeners for an event */
  static count<Events>(ee: EventEmitter<Events>, type: keyof Events): number {
    let count = 0
    let list = ee[ev][type] as LinkedList<Listener<Events>> | void
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
  static has<Events>(
    ee: EventEmitter<Events>,
    type: '*' | keyof Events
  ): boolean {
    if (type == '*') {
      for (type in ee[ev]) return true
      return false
    }
    return ee[ev][type] !== undefined
  }

  /** Get an array of event types that have listeners */
  static keys<Events>(ee: EventEmitter<Events>): Array<keyof Events> {
    return Object.keys(ee[ev]) as any
  }

  /** Add many recurring listeners */
  on(map: ListenerMap<Events>): this

  /** Add a recurring listener */
  on<T extends keyof Events, U extends Listener<Events, T>>(type: T, fn: U): U

  /** Implementation */
  on(
    arg: keyof Events | ListenerMap<Events>,
    fn?: Listener<Events>
  ): this | typeof fn {
    return this[on](arg, fn)
  }

  /** Add many one-time listeners */
  one(map: ListenerMap<Events>): this

  /** Add a one-time listener */
  one<T extends keyof Events>(type: T, fn: Listener<Events, T>): typeof fn

  /** Implementation */
  one(
    arg: keyof Events | ListenerMap<Events>,
    fn?: Listener<Events>
  ): this | typeof fn {
    return this[on](arg, fn, true)
  }

  /** Remove all listeners from all events */
  off(type: '*'): this

  /** Remove one or all listeners of an event */
  off<T extends keyof Events>(type: T, fn?: Listener<Events, T>): this

  /** Implementation */
  off(arg: '*' | keyof Events, fn?: Listener<Events>): this {
    if (arg == '*') {
      this[ev] = {}
      return this
    }
    if (fn) {
      let list = this[ev][arg] as LinkedList<typeof fn> | null
      if (list && unlink(list, l => l.fn == fn)) {
        return this
      }
    }
    delete this[ev][arg]
    return this
  }

  /** Call the listeners of an event */
  emit<T extends keyof Events>(
    type: T,
    ...args: ArgList<Events[T]>
  ): Events[T] extends AnyFunction ? ReturnType<Events[T]> | void : any

  /** Implementation */
  emit<T extends keyof Events>(type: T, ...args: ArgList<Events[T]>): any {
    let result
    for (let listener of this.listeners(type)) {
      let val = listener(...args)
      if (val !== undefined) {
        result = val
      }
    }
    return result
  }

  /** Iterate over the listeners of an event */
  *listeners<T extends keyof Events>(
    type: T
  ): IterableIterator<Listener<Events, T>> {
    let list = this[ev][type]
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
          delete this[ev][type]
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

  /** Implementation of the `on` and `one` methods */
  private [on](
    arg: keyof Events | ListenerMap<Events>,
    fn?: Listener<Events>,
    once: boolean = false
  ): this | typeof fn {
    if (typeof arg == 'object') {
      for (let type in arg) {
        if (typeof arg[type] == 'function') {
          addListener(this[ev], type, {
            fn: arg[type]!,
            once,
            next: null,
          })
        }
      }
      return this
    }
    if (typeof fn == 'function') {
      addListener(this[ev], arg, {
        fn,
        once,
        next: null,
      })
    }
    return fn
  }
}

function addListener<Events>(
  cache: { [T in keyof Events]?: LinkedList<Listener<Events, T>> },
  type: keyof Events,
  cb: IListener<Listener<Events>>
): void {
  let list = cache[type]
  if (list) {
    list.last.next = cb
    list.last = cb
  } else {
    cache[type] = {
      first: cb,
      last: cb,
    }
  }
}

/** Remove listeners that match the filter function */
function unlink<T>(
  list: LinkedList<T>,
  filter: (cb: IListener<T>) => boolean
): LinkedList<T> | null {
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

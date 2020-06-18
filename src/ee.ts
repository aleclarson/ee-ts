import {
  EventArgs,
  EventKey,
  Listener,
  ListenerMap,
  ListenerCache,
  Falsy,
} from './types'

/** The symbol for storing all listeners */
export const $listeners = Symbol('EventEmitter.listeners')

/** Statically typed event emitter */
export class EventEmitter<T = any> {
  protected [$listeners]: { [key: string]: Set<Listener> | undefined }

  constructor() {
    Object.defineProperty(this, $listeners, {
      value: Object.create(null),
    })
  }

  /** Add a recurring listener */
  on<K extends EventKey<T>, Fn extends Listener<T, K> | Falsy>(
    key: K,
    fn: Fn
  ): Fn
  /** Add many recurring listeners */
  on(map: ListenerMap<T>): this
  /** @internal */
  on(arg: any, fn?: Listener<T> | Falsy) {
    if (arguments.length == 2) {
      if (fn) this._addListener(arg, fn)
      return fn
    }
    for (let key in arg) {
      if ((fn = arg[key])) this._addListener(key, fn)
    }
    return this
  }

  /** Remove all listeners of an event */
  off<K extends EventKey<T>>(key: K): this
  /** Remove a listener of an event */
  off<K extends EventKey<T>>(key: K, fn: Listener<T, K>): this
  /** @internal */
  off<K extends EventKey<T>>(key: K, fn?: Listener<T, K>) {
    if (arguments.length == 2) {
      if (fn) this._removeListener(key, fn)
    } else if (key == '*') {
      Object.keys(this[$listeners]).forEach(key => this.off(key as any))
    } else {
      this.getListeners(key).forEach(fn => this._removeListener(key, fn))
    }
    return this
  }

  /** Call the listeners of an event */
  emit<K extends EventKey<T>>(key: K, ...args: EventArgs<T, K>) {
    if (getListeners(this, 'emit')) {
      this._emit('emit', [key, args])
    }
    this._emit(key, args)
  }

  /** Check if listeners exist for the given event key. */
  hasListeners(key: EventKey<T>) {
    return !!getListeners(this, key)
  }

  /** Get the listener cache for the given event key. */
  getListeners<K extends EventKey<T>>(key: K): ReadonlySet<Listener<T, K>>
  /** Get the listener cache for all event keys. */
  getListeners<K extends EventKey<T>>(): ListenerCache<T>
  /** @internal */
  getListeners(key?: string) {
    return (arguments.length
      ? getListeners(this, key!) || emptySet
      : this[$listeners]) as any
  }

  /**
   * Create the `Set<Listener>` for the given event key.
   *
   * Returns the new listener set.
   *
   * Use `return super._addListeners(key)` if you override.
   */
  protected _addListeners(key: string) {
    return (this[$listeners][key] = new Set())
  }

  /**
   * Remove the `Set<Listener>` for the given event key.
   *
   * Use `super._removeListeners(key)` if you override.
   */
  protected _removeListeners(key: string) {
    delete this[$listeners][key]
  }

  /**
   * Add a `Listener` for the given event key.
   *
   * Use `super._addListeners(key, fn)` if you override.
   */
  protected _addListener(key: string, fn: Listener) {
    let list = getListeners(this, key) || this._addListeners(key)
    list.add(fn)
  }

  /**
   * Remove a `Listener` for the given event key.
   *
   * Returns `true` if the given listener was successfully removed.
   *
   * Use `return super._removeListener(key, fn)` if you override.
   */
  protected _removeListener(key: string, fn: Listener) {
    let list = getListeners(this, key)
    if (list && list.delete(fn)) {
      if (!list.size) {
        this._removeListeners(key)
      }
      return true as boolean
    }
  }

  /**
   * Invoke listeners of the given event key using the given arguments.
   *
   * Use `super._emit(key, args)` if you override.
   */
  protected _emit(key: string, args: any[]) {
    let list = getListeners(this, key)
    if (list) {
      list.forEach(fn => fn(...args) !== false || this._removeListener(key, fn))
      if (!list.size) {
        this._removeListeners(key)
      }
    }
  }
}

const emptySet: ReadonlySet<any> = Object.freeze(new Set()) as any

const getListeners: GetListeners = (ee: EventEmitter, key: string) =>
  ee[$listeners][key]

interface GetListeners extends Function {
  // Strict getter
  <T, K extends EventKey<T>>(ee: EventEmitter<T>, key: K):
    | Set<Listener<T, K>>
    | undefined

  // Loose getter
  (ee: EventEmitter, key: string): Set<Listener> | undefined
}

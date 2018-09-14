Object.defineProperty(exports, "__esModule", { value: true });
const ev = Symbol('EventEmitter.listeners');
const on = Symbol('EventEmitter.addListener');
/** Statically typed event emitter */
class EventEmitter {
    constructor() {
        this[ev] = {};
    }
    /** Count the number of listeners for an event */
    static count(ee, key) {
        let count = 0;
        let list = ee[ev][key];
        if (list) {
            let cb = list.first;
            while (++count) {
                if (cb.next) {
                    cb = cb.next;
                }
                else
                    break;
            }
        }
        return count;
    }
    /** Check if an event has listeners */
    static has(ee, key) {
        if (key == '*') {
            for (key in ee[ev])
                return true;
            return false;
        }
        return ee[ev][key] !== undefined;
    }
    /** Get an array of event keys that have listeners */
    static keys(ee) {
        return Object.keys(ee[ev]);
    }
    /** Call the given listener when no other listeners exist */
    static unhandle(ee, key, fn) {
        return ee[on](key, (...args) => {
            if (!ee[ev][key].first.next)
                return fn(...args);
        });
    }
    /** Implementation */
    on(arg, fn) {
        return this[on](arg, fn);
    }
    /** Implementation */
    one(arg, fn) {
        return this[on](arg, fn, true);
    }
    /** Implementation */
    off(arg, fn) {
        if (arg == '*') {
            let cache = this[ev];
            this[ev] = {};
            if (this._onEventUnhandled) {
                for (let key in cache) {
                    this._onEventUnhandled(key);
                }
            }
            return this;
        }
        if (typeof fn == 'function') {
            let list = this[ev][arg];
            if (list && unlink(list, l => l.fn == fn)) {
                return this;
            }
        }
        delete this[ev][arg];
        if (this._onEventUnhandled) {
            this._onEventUnhandled(arg);
        }
        return this;
    }
    /** Implementation */
    emit(key, ...args) {
        let result;
        for (let listener of this.listeners(key)) {
            let val = listener(...args);
            if (val !== undefined) {
                result = val;
            }
        }
        return result;
    }
    /** Iterate over the listeners of an event */
    *listeners(key) {
        let list = this[ev][key];
        if (!list)
            return;
        let prev = null;
        let curr = list.first;
        while (true) {
            yield curr.fn;
            // One-time listener
            if (curr.once) {
                // Splice it.
                if (prev) {
                    prev.next = curr.next;
                }
                // Shift it.
                else if (curr.next) {
                    list.first = curr = curr.next;
                    continue;
                }
                // Delete it.
                else {
                    delete this[ev][key];
                    if (this._onEventUnhandled) {
                        this._onEventUnhandled(key);
                    }
                    return;
                }
            }
            // Recurring listener
            else {
                prev = curr;
            }
            // Continue to the next listener.
            if (curr.next) {
                curr = curr.next;
                continue;
            }
            // Update the last listener.
            list.last = curr;
            // All done.
            return;
        }
    }
    /** Implementation of the `on` and `one` methods */
    [on](arg, fn, once = false) {
        if (typeof arg == 'object') {
            let key;
            for (key in arg) {
                if (typeof arg[key] == 'function') {
                    let fn = arg[key];
                    let list = addListener(this[ev], key, {
                        fn,
                        once,
                        next: null
                    });
                    if (fn == list.first.fn && this._onEventHandled) {
                        this._onEventHandled(key);
                    }
                }
            }
            return this;
        }
        if (typeof fn == 'function') {
            let list = addListener(this[ev], arg, {
                fn,
                once,
                next: null
            });
            if (fn == list.first.fn && this._onEventHandled) {
                this._onEventHandled(arg);
            }
        }
        return fn;
    }
}
/** Unique symbol for accessing the internal listener cache */
EventEmitter.ev = ev;
exports.EventEmitter = EventEmitter;
function addListener(cache, key, cb) {
    let list = cache[key];
    if (list) {
        list.last.next = cb;
        list.last = cb;
    }
    else {
        cache[key] = list = { first: cb, last: cb };
    }
    return list;
}
/** Remove listeners that match the filter function */
function unlink(list, filter) {
    let prev = null;
    let curr = list.first;
    while (true) {
        // Return true to unlink the listener.
        if (filter(curr)) {
            // Splice it.
            if (prev) {
                prev.next = curr.next;
                if (curr.next) {
                    curr = curr.next;
                }
                else
                    break;
            }
            // Shift it.
            else if (curr.next) {
                list.first = curr = curr.next;
            }
            // No listeners remain.
            else {
                return null;
            }
        }
        // Keep this listener.
        else {
            prev = curr;
            if (curr.next) {
                curr = curr.next;
            }
            else
                break;
        }
    }
    // At least one listener remains.
    list.last = prev;
    return list;
}

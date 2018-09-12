Object.defineProperty(exports, "__esModule", { value: true });
const ev = Symbol('EventEmitter.listeners');
const on = Symbol('EventEmitter.addListener');
/** Statically typed event emitter */
class EventEmitter {
    constructor() {
        this[ev] = {};
    }
    /** Count the number of listeners for an event */
    static count(ee, type) {
        let count = 0;
        let list = ee[ev][type];
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
    static has(ee, type) {
        if (type == '*') {
            for (type in ee[ev])
                return true;
            return false;
        }
        return ee[ev][type] !== undefined;
    }
    /** Get an array of event types that have listeners */
    static keys(ee) {
        return Object.keys(ee[ev]);
    }
    /** Call the given listener when no other listeners exist */
    static unhandle(ee, type, fn) {
        let self = (...args) => {
            if (!ee[ev][type].first.next)
                return fn(...args);
        };
        return ee.on(type, self);
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
                for (let type in cache) {
                    this._onEventUnhandled(type);
                }
            }
            return this;
        }
        if (fn) {
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
    emit(type, ...args) {
        let result;
        for (let listener of this.listeners(type)) {
            let val = listener(...args);
            if (val !== undefined) {
                result = val;
            }
        }
        return result;
    }
    /** Iterate over the listeners of an event */
    *listeners(type) {
        let list = this[ev][type];
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
                    delete this[ev][type];
                    if (this._onEventUnhandled) {
                        this._onEventUnhandled(type);
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
            for (let type in arg) {
                if (typeof arg[type] == 'function') {
                    let fn = arg[type];
                    let list = addListener(this[ev], type, {
                        fn,
                        once,
                        next: null
                    });
                    if (fn == list.first.fn && this._onEventHandled) {
                        this._onEventHandled(type);
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
function addListener(cache, type, cb) {
    let list = cache[type];
    if (list) {
        list.last.next = cb;
        list.last = cb;
    }
    else {
        cache[type] = list = { first: cb, last: cb };
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

var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.$listeners = Symbol('EventEmitter.listeners');
exports.$addListener = Symbol('EventEmitter.addListener');
/** Statically typed event emitter */
var EventEmitter = /** @class */ (function () {
    function EventEmitter() {
        this[exports.$listeners] = {};
    }
    /** Count the number of listeners for an event */
    EventEmitter.count = function (ee, key) {
        var count = 0;
        var list = ee[exports.$listeners][key];
        if (list) {
            var cb = list.first;
            while (++count) {
                if (cb.next) {
                    cb = cb.next;
                }
                else
                    break;
            }
        }
        return count;
    };
    /** Check if an event has listeners */
    EventEmitter.has = function (ee, key) {
        if (key == '*') {
            for (key in ee[exports.$listeners])
                return true;
            return false;
        }
        return ee[exports.$listeners][key] !== undefined;
    };
    /** Get an array of event keys that have listeners */
    EventEmitter.keys = function (ee) {
        return Object.keys(ee[exports.$listeners]);
    };
    /** Call the given listener when no other listeners exist */
    EventEmitter.unhandle = function (ee, key, impl, disposables) {
        var listener = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            if (!ee[exports.$listeners][key].first.next)
                return impl.apply(void 0, args);
        };
        return ee.on(key, listener, disposables);
    };
    /** Implementation */
    EventEmitter.prototype.on = function (arg, fn, disposables) {
        if (typeof fn == 'function') {
            return this[exports.$addListener](arg, fn, disposables);
        }
        return this[exports.$addListener](arg, undefined, fn);
    };
    /** Implementation */
    EventEmitter.prototype.one = function (arg, fn, disposables) {
        if (typeof fn == 'function') {
            return this[exports.$addListener](arg, fn, disposables, true);
        }
        return this[exports.$addListener](arg, undefined, fn, true);
    };
    /** Implementation */
    EventEmitter.prototype.off = function (arg, fn) {
        if (arg == '*') {
            var cache = this[exports.$listeners];
            this[exports.$listeners] = {};
            if (this._onEventUnhandled) {
                for (var key in cache) {
                    this._onEventUnhandled(key);
                }
            }
            return this;
        }
        if (typeof fn == 'function') {
            var list = this[exports.$listeners][arg];
            if (list && unlink(list, function (l) { return l.fn == fn; })) {
                return this;
            }
        }
        delete this[exports.$listeners][arg];
        if (this._onEventUnhandled) {
            this._onEventUnhandled(arg);
        }
        return this;
    };
    /** Implementation */
    EventEmitter.prototype.emit = function (key) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var result;
        var gen = this.listeners(key);
        while (true) {
            var _a = gen.next(), listener = _a.value, done = _a.done;
            if (done) {
                return result;
            }
            else {
                var generated = listener.apply(void 0, args);
                if (generated !== undefined) {
                    result = generated;
                }
            }
        }
    };
    /** Iterate over the listeners of an event */
    EventEmitter.prototype.listeners = function (key) {
        var list, prev, curr;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    list = this[exports.$listeners][key];
                    if (!list)
                        return [2 /*return*/];
                    prev = null;
                    curr = list.first;
                    _a.label = 1;
                case 1:
                    if (!true) return [3 /*break*/, 3];
                    return [4 /*yield*/, curr.fn
                        // One-time listener
                    ];
                case 2:
                    _a.sent();
                    // One-time listener
                    if (curr.once) {
                        // Splice it.
                        if (prev) {
                            prev.next = curr.next;
                        }
                        // Shift it.
                        else if (curr.next) {
                            list.first = curr = curr.next;
                            return [3 /*break*/, 1];
                        }
                        // Delete it.
                        else {
                            delete this[exports.$listeners][key];
                            if (this._onEventUnhandled) {
                                this._onEventUnhandled(key);
                            }
                            return [2 /*return*/];
                        }
                    }
                    // Recurring listener
                    else {
                        prev = curr;
                    }
                    // Continue to the next listener.
                    if (curr.next) {
                        curr = curr.next;
                        return [3 /*break*/, 1];
                    }
                    // Update the last listener.
                    list.last = curr;
                    // All done.
                    return [2 /*return*/];
                case 3: return [2 /*return*/];
            }
        });
    };
    /** Implementation of the `on` and `one` methods */
    EventEmitter.prototype[exports.$addListener] = function (arg, fn, disposables, once) {
        var _this = this;
        if (once === void 0) { once = false; }
        if (typeof arg == 'object') {
            var key_1;
            var _loop_1 = function () {
                if (typeof arg[key_1] == 'function') {
                    var fn_1 = arg[key_1];
                    var list = addListener(this_1[exports.$listeners], key_1, {
                        fn: fn_1,
                        once: once,
                        next: null,
                    });
                    if (disposables) {
                        disposables.push({
                            dispose: function () { return _this.off(key_1, fn_1); },
                        });
                    }
                    if (fn_1 == list.first.fn && this_1._onEventHandled) {
                        this_1._onEventHandled(key_1);
                    }
                }
            };
            var this_1 = this;
            for (key_1 in arg) {
                _loop_1();
            }
            return this;
        }
        if (typeof fn == 'function') {
            var key_2 = arg;
            var list = addListener(this[exports.$listeners], key_2, {
                fn: fn,
                once: once,
                next: null,
            });
            if (disposables) {
                disposables.push({
                    dispose: function () { return _this.off(key_2, fn); },
                });
            }
            if (fn == list.first.fn && this._onEventHandled) {
                this._onEventHandled(arg);
            }
        }
        return fn;
    };
    /** Unique symbol for accessing the internal listener cache */
    EventEmitter.ev = exports.$listeners;
    return EventEmitter;
}());
exports.EventEmitter = EventEmitter;
function addListener(cache, key, cb) {
    var list = cache[key];
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
    var prev = null;
    var curr = list.first;
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

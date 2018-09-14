# ee-ts

Type-safe event emitters (for TypeScript)

### Features
- strict event names
- type-checking for emitted data
- flexible `listeners()` generator method
- add/remove listeners during emit
- great for sub-classing
- one-time listeners
- default handlers

### Usage
```ts
import {EventEmitter as EE} from 'ee-ts'

// All events must be declared here to enable type-checking
// for the emitter and its listeners.
interface Events {
  ready(): void
  add(a: number, b: number): number
}

let ee = new EE<Events>

/**
 * The result of `emit` equals the last value
 * returned by a listener. (excluding `undefined`)
 *
 * Undefined is always a valid return value.
 */
ee.on('add', (a, b) => a - b)
ee.on('add', (a, b) => a + b) // this return value is used
ee.on('add', (a, b) => undefined)
ee.emit('add', 1, 2)  // => 3

/**
 * The `one` method creates one-time listeners.
 */
let i = 0
ee.one('ready', () => ++i)
ee.emit('ready')  // => 1
ee.emit('ready')  // => undefined

/**
 * Call listeners manually for better flow control.
 */
for (let listener of ee.listeners('ready')) {
  listener()
}

/**
 * Add multiple listeners with `on` or `once`
 */
ee.on({
  ready: () => {},
  add: (a, b) => a + b,
})

/** Your function is returned by `on` and `one` */
let fn = ee.on('ready', () => {})

/** Remove a single listener */
ee.off('ready', fn)

/** Remove all "ready" listeners */
ee.off('ready')

/** Remove all listeners */
ee.off('*')
```

#### Static methods

```ts
/** Handle uncaught "error" events */
EE.unhandle(ee, 'error', (error) => {
  throw error
})

/** Count the number of listeners for an event */
EE.count(ee, 'error')

/** Check if an event has listeners */
EE.has(ee, 'error')

/** Get an array of event types that have listeners */
EE.keys(ee)
```

#### Subclassing

This library was designed with subclassing in mind.

- The internal cache is non-enumerable
- Few public methods: `on`, `one`, `off`, `emit`, `listeners`
- Override `_onEventHandled(type: string)` to know when an event has at least one listener
- Override `_onEventUnhandled(type: string)` to know when an event has no listeners

```ts
// Define the possible events.
namespace App {
  interface Events {
    foo(): void
    bar(a: number, b: number): number
  }
}

// Define the subclass.
class App extends EE<App.Events> {
  /* ... */
}

let app = new App()

// [error] Cannot emit an unknown event.
app.emit('unknown-event')

// [error] Cannot listen to an unknown event.
app.on('unknown-event', () => {})

// [error] Cannot remove listeners of an unknown event.
app.off('unknown-event')

// [error] Invalid argument type
app.one('foo', (invalid: boolean) => {})

// [error] Invalid return type
app.one('bar', () => true)
```

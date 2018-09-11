# ee-ts

Type-safe event emitters (for TypeScript)

### Features
- strict event names
- strict type signatures for `emit()` and listeners
- flow control with `listeners()`
- add and remove listeners during emit
- one-time and recurring listeners
- remove one listener or all listeners of an event
- remove the listeners of every event

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

# ee-ts

[![npm](https://img.shields.io/npm/v/ee-ts.svg)](https://www.npmjs.com/package/ee-ts)
[![Bundle size](https://badgen.net/bundlephobia/min/ee-ts)](https://bundlephobia.com/result?p=ee-ts)
[![Install size](https://packagephobia.now.sh/badge?p=ee-ts)](https://packagephobia.now.sh/result?p=ee-ts)
[![Build status](https://travis-ci.org/aleclarson/ee-ts.svg?branch=master)](https://travis-ci.org/aleclarson/ee-ts)
[![Coverage status](https://coveralls.io/repos/github/aleclarson/ee-ts/badge.svg?branch=master)](https://coveralls.io/github/aleclarson/ee-ts?branch=master)
[![Code style: Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![Donate](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://paypal.me/alecdotbiz)

Type-safe event emitters (for TypeScript)

### Features

- strict event names
- type-checking for emitted data
- flexible `listeners()` generator method
- add/remove listeners during emit
- great for sub-classing
- one-time listeners
- default handlers

&nbsp;

### Example

```ts
import { EventEmitter as EE } from 'ee-ts'

type User = { name: string }

// All possible events must be explicitly defined as methods here.
// The return type can be non-void because the `emit` method returns the last non-void value.
// The return type can never be required, because `void` is implicitly added to every event.
interface Events {
  login(user: User): void
  logout(): string
}

// Make your subclass generic to let users add their own events.
class App<T = {}> extends EE<T & Events> {
  /* ... */
}

let app = new App()

// The type of `user` is inferred.
app.on('login', user => {
  console.log(user.name) // user.name is string
})

// Invalid argument types are caught.
app.one('login', (invalid: boolean) => {}) // [ts] Type 'User' is not assignable to type 'boolean'.

// Invalid return values are caught.
app.one('logout', () => true) // [ts] Type 'boolean' is not assignable to type 'string | void'.

// Unknown event names are caught.
app.emit('invalid') // [ts] Argument of type '"invalid"' is not assignable to parameter of type '"login" | "logout"'.
```

&nbsp;

### Subclassing

This library was designed with subclassing in mind.

- The internal cache is non-enumerable
- Few public methods: `on`, `one`, `off`, `emit`, `listeners`
- Override `_onEventHandled(key: string)` to know when an event has at least one listener
- Override `_onEventUnhandled(key: string)` to know when an event has no listeners

&nbsp;

### Disposables

When you pass an array as the last argument of `on`, `one`, or `EE.unhandle`,
an object is pushed onto it. This object has a `dispose(): void` method, which
you should call to remove the associated listener from its event.

This is a useful way of grouping listeners together.

```ts
import { EventEmitter, Disposable } from 'ee-ts'

const ee = new EventEmitter<{ foo(): void }>()

const disposables: Disposable[] = []

let count = 0
const fn = ee.on('foo', () => count++, disposables)

assert(disposables.length == 1)

disposables[0].dispose()
ee.emit('foo')

assert(count == 0)
```

&nbsp;

## API Reference

The type signatures below are _not_ 100% accurate. They're here to give you a general idea of the API. Find the real type signatures in [the source code](./src/ee.ts) or [VS Code](https://code.visualstudio.com/docs/editor/intellisense).

&nbsp;

#### `on(key: string, fn: Function, disposables?: Disposable[]): Function`

Add a listener to the given event key.

Use the `one` method to add a one-time listener.

_Returns:_ the `fn` argument

&nbsp;

#### `on(map: { [key: string]: Function }, disposables?: Disposable[]): this`

Add every listener value to its associated event key.

Use the `one` method to add one-time listeners.

&nbsp;

#### `off(key: string, fn?: Function): this`

Remove a listener for the given event key.

Omit the `fn` argument to remove all listeners for the given event key.

Call `off('*')` to remove all listeners for every event key.

&nbsp;

#### `emit(key: string, ...args: any[]): any`

Emit an event to listeners associated with the given event key.

You can safely add/remove listeners from inside a listener.

_Returns:_ last non-void value returned by a listener

&nbsp;

#### `listeners(key: string): IterableIterator<Function>`

Create a generator of the listeners for the given event key.

Use this with `for..of` or spread it into an array. Read more about generators [here](https://medium.com/javascript-scene/the-hidden-power-of-es6-generators-observable-async-flow-control-cfa4c7f31435).

&nbsp;

## Static methods

&nbsp;

#### `unhandle(ee: EventEmitter, key: string, fn: Function, disposables?: Disposable[]): Function`

Set the default handler for an event key.

The default handler is called when no other listeners exist for the same event key.

&nbsp;

#### `keys(ee: EventEmitter): string[]`

Get an array of event keys that have listeners.

&nbsp;

#### `count(ee: EventEmitter, key: string): number`

Get the number of listeners an event has.

&nbsp;

#### `has(ee: EventEmitter, key: string): boolean`

Check if an event has listeners.

_Returns:_ true when the given event key has `>= 1` listener.

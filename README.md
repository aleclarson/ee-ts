# ee-ts

[![npm](https://img.shields.io/npm/v/ee-ts.svg)](https://www.npmjs.com/package/ee-ts)
[![Build status](https://travis-ci.org/aleclarson/ee-ts.svg?branch=master)](https://travis-ci.org/aleclarson/ee-ts)
[![codecov](https://codecov.io/gh/aleclarson/ee-ts/branch/master/graph/badge.svg)](https://codecov.io/gh/aleclarson/ee-ts)
[![Bundle size](https://badgen.net/bundlephobia/min/ee-ts)](https://bundlephobia.com/result?p=ee-ts)
[![Install size](https://packagephobia.now.sh/badge?p=ee-ts)](https://packagephobia.now.sh/result?p=ee-ts)
[![Code style: Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Donate](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://paypal.me/alecdotbiz)

Type-safe event emitters (for TypeScript)

### Features

- strict event names + argument types
- add/remove listeners during emit
- useful subclass methods
- one-time listeners

&nbsp;

### Example

```ts
import { EventEmitter } from 'ee-ts'

type User = { name: string }

// All possible events must be explicitly defined as methods here.
// The return type can be non-void because the `emit` method returns the last non-void value.
// The return type can never be required, because `void` is implicitly added to every event.
interface AppEvents {
  login(user: User): void
  logout(): string
}

// Make your subclass generic to let users add their own events.
class App<T = {}> extends EventEmitter<T & AppEvents> {
  // You _cannot_ emit user-added events from here, though.
  logout(this: App) {
    this.emit('logout')
  }
}

type CustomEvents = { test(): void }
let app = new App<CustomEvents>()

// Emit your custom event.
app.emit('test')

// The type of `user` is inferred.
app.on('login', user => {
  console.log(user.name) // user.name is string

  // Return false to stop listening.
  return false
})

// Invalid argument types are caught.
app.on('login', (invalid: boolean) => {}) // [ts] Type 'User' is not assignable to type 'boolean'.

// Unknown event names are caught.
app.emit('invalid') // [ts] Argument of type '"invalid"' is not assignable to parameter of type '"login" | "logout" | "test"'.
```

&nbsp;

### Subclassing

The `EventEmitter` class provides a few useful methods for subclasses to override.

- The `_addListener(key, fn)` and `_removeListener(key, fn)` methods are called for every
  listener that is added/removed.

- The `_addListeners(key)` method creates the internal cache for listeners of the given event key. Override if you want to know when an event is being handled.

- The `_removeListeners(key)` method removes the internal cache for listeners of the given event key. Override if you want to know when an event is not being handled anymore.

&nbsp;

## API Reference

The type signatures below are _not_ 100% accurate. They're here to give you a general idea of the API. Find the real type signatures in [the source code](./src/ee.ts) or [VS Code](https://code.visualstudio.com/docs/editor/intellisense).

&nbsp;

#### `on(key: string, fn: Function | Falsy): typeof fn`

Add a listener to the given event key.

Your listener can return `false` to stop listening.

_Returns:_ the `fn` argument

&nbsp;

#### `on(map: { [key: string]: Function | Falsy }): this`

Add every listener value to its associated event key. Falsy values are skipped.

Your listeners can return `false` to stop listening.

&nbsp;

#### `off(key: string, fn?: Function): this`

Remove a listener for the given event key.

Omit the `fn` argument to remove all listeners for the given event key.

Call `off('*')` to remove all listeners for every event key.

&nbsp;

#### `emit(key: string, ...args: any[]): void`

Emit an event to listeners associated with the given event key.

You can safely add/remove listeners from inside a listener.

&nbsp;

#### `getListeners(): object`

Get the internal cache for all event keys.

&nbsp;

#### `getListeners(key: string): Set<Function>`

Get the internal cache for the given event key.

&nbsp;

#### `hasListeners(key: string): void`

Returns `true` when the given event key has listeners.

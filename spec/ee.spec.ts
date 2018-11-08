/* tslint:disable:no-empty */
import { EventEmitter as EE } from '..'

interface A {
  foo(): void
  bar(a: number, b: number): number
}

/**
 * Recurring listeners
 */

test('add a recurring listener', () => {
  let ee = new EE<A>()
  let fn = jest.fn()
  expect(ee.on('foo', fn)).toBe(fn)
  ee.emit('foo')
  expect(fn.mock.calls.length).toBe(1)
  ee.emit('foo')
  expect(fn.mock.calls.length).toBe(2)
})

test('add multiple recurring listeners', () => {
  let ee = new EE<A>()
  let fn = jest.fn()
  expect(
    ee.on({
      foo: fn,
      bar: fn,
    })
  ).toBe(ee)
  ee.emit('foo')
  ee.emit('bar', 1, 2)
  ee.emit('foo')
  ee.emit('bar', 3, 4)
  expect(fn.mock.calls).toEqual([[], [1, 2], [], [3, 4]])
})

test('emit returns last return value (excluding undefined)', () => {
  let ee = new EE<A>()
  ee.on('bar', () => {})
  ee.on('bar', () => 1)
  ee.on('bar', () => {})
  ee.on('bar', () => 2)
  ee.on('bar', () => {})
  expect(ee.emit('bar', 1, 2)).toBe(2)
})

/**
 * One-time listeners
 */

test('add a one-time listener', () => {
  let ee = new EE<A>()
  let fn = jest.fn()
  ee.on('foo', () => {})
  ee.one('foo', fn)
  ee.on('foo', () => {})
  ee.emit('foo')
  expect(EE.count(ee, 'foo')).toBe(2)
  expect(fn).toHaveBeenCalledTimes(1)
  ee.emit('foo')
  expect(fn).toHaveBeenCalledTimes(1)
})

test('add multiple one-time listeners', () => {
  let ee = new EE<A>()
  let f1 = ee.one('foo', jest.fn())
  let f2 = ee.one('foo', jest.fn())
  ee.emit('foo')
  ee.emit('foo')
  expect(f1).toHaveBeenCalledTimes(1)
  expect(f2).toHaveBeenCalledTimes(1)
  expect(EE.count(ee, 'foo')).toBe(0)
})

test('remove a one-time listener', () => {
  let ee = new EE<A>()
  let fn = jest.fn()
  ee.on('foo', () => {})
  ee.one('foo', fn)
  ee.on('foo', () => {})
  ee.off('foo', fn)
  ee.emit('foo')
  expect(fn).toHaveBeenCalledTimes(0)
  expect(EE.count(ee, 'foo')).toBe(2)
})

test('multiple consecutive one-time listeners', () => {
  let ee = new EE<A>()
  let fn = jest.fn()
  ee.one('foo', fn)
  ee.one('foo', fn)
  ee.emit('foo')
  ee.emit('foo')
  expect(fn).toHaveBeenCalledTimes(2)
  expect(EE.count(ee, 'foo')).toBe(0)
})

/**
 * Removed listeners
 */

test('remove a recurring listener', () => {
  let ee = new EE<A>()
  let fn = jest.fn()
  ee.on('foo', () => {})
  ee.on('foo', fn)
  ee.on('foo', () => {})
  ee.off('foo', fn)
  ee.emit('foo')
  expect(fn).toHaveBeenCalledTimes(0)
  expect(EE.count(ee, 'foo')).toBe(2)
})

test('remove the only listener of an event', () => {
  let ee = new EE<A>()
  let fn = jest.fn()
  ee.on('foo', fn)
  ee.off('foo', fn)
  ee.emit('foo')
  expect(fn).toHaveBeenCalledTimes(0)
  expect(EE.count(ee, 'foo')).toBe(0)
})

test('remove the first listener of an event', () => {
  let ee = new EE<A>()
  let fn = jest.fn()
  ee.on('foo', fn)
  ee.on('foo', () => {})
  ee.off('foo', fn)
  ee.emit('foo')
  expect(fn).toHaveBeenCalledTimes(0)
  expect(EE.count(ee, 'foo')).toBe(1)
})

test('remove the last listener of an event', () => {
  let ee = new EE<A>()
  let fn = jest.fn()
  ee.on('foo', () => {})
  ee.on('foo', fn)
  ee.off('foo', fn)
  ee.emit('foo')
  expect(fn).toHaveBeenCalledTimes(0)
  expect(EE.count(ee, 'foo')).toBe(1)
})

test('remove all listeners of an event', () => {
  let ee = new EE<A>()
  let fn = jest.fn()
  ee.on('foo', () => fn())
  ee.on('foo', () => fn())
  ee.on('foo', () => fn())
  ee.off('foo')
  ee.emit('foo')
  expect(fn).toHaveBeenCalledTimes(0)
  expect(EE.count(ee, 'foo')).toBe(0)
})

test('remove all listeners of all events', () => {
  let ee = new EE<A>()
  let fn = jest.fn()
  ee.on('foo', () => fn())
  ee.on('bar', () => fn())
  ee.off('*')
  ee.emit('foo')
  ee.emit('bar', 1, 2)
  expect(fn).toHaveBeenCalledTimes(0)
  expect(EE.count(ee, 'foo')).toBe(0)
  expect(EE.count(ee, 'bar')).toBe(0)
})

test('remove current listener during emit', () => {
  let ee = new EE<A>()
  let fn = jest.fn(() => {
    ee.off('foo', fn)
  })
  ee.on('foo', () => {})
  ee.on('foo', fn)
  ee.on('foo', () => {})
  ee.emit('foo')
  expect(fn).toHaveBeenCalledTimes(1)
  expect(EE.count(ee, 'foo')).toBe(2)
  ee.emit('foo')
  expect(fn).toHaveBeenCalledTimes(1)
})

test('remove pending listener during emit', () => {
  let ee = new EE<A>()
  let fn = jest.fn()
  ee.on('foo', () => ee.off('foo', fn))
  ee.on('foo', fn)
  ee.emit('foo')
  expect(fn).toHaveBeenCalledTimes(0)
  expect(EE.count(ee, 'foo')).toBe(1)
})

test('remove finished listener during emit', () => {
  let ee = new EE<A>()
  let fn = jest.fn()
  ee.on('foo', fn)
  ee.on('foo', () => ee.off('foo', fn))
  ee.emit('foo')
  expect(fn).toHaveBeenCalledTimes(1)
  expect(EE.count(ee, 'foo')).toBe(1)
  ee.emit('foo')
  expect(fn).toHaveBeenCalledTimes(1)
})

test('remove a listener that was added twice', () => {
  let ee = new EE<A>()
  let fn = jest.fn()
  ee.on('foo', fn)
  ee.on('foo', () => ee.off('foo', fn))
  ee.on('foo', fn)
  ee.emit('foo')
  expect(fn).toHaveBeenCalledTimes(1)
  expect(EE.count(ee, 'foo')).toBe(1)
  ee.emit('foo')
  expect(fn).toHaveBeenCalledTimes(1)
})

test('remove a listener that was never added', () => {
  let ee = new EE<A>()
  let fn = jest.fn()
  ee.on('foo', fn)
  ee.off('foo', () => {})
  ee.emit('foo')
  expect(fn).toHaveBeenCalledTimes(1)
})

/**
 * Listeners iterable
 */

test('iterate over listeners', () => {
  let ee = new EE<A>()
  let fn1 = ee.on('foo', jest.fn())
  let fn2 = ee.on('foo', jest.fn())
  expect([...ee.listeners('foo')]).toEqual([fn1, fn2])
})

test('try iterating over event with no listeners', () => {
  let ee = new EE<A>()
  expect([...ee.listeners('foo')]).toEqual([])
})

/**
 * Disposables
 */

test('pass an array to collect disposables', () => {
  let ee = new EE<A>()
  let list: Array<{ dispose(): void }> = []
  let fn1 = ee.on('foo', jest.fn(), list)
  let fn2 = ee.on('foo', jest.fn(), list)
  ee.emit('foo')

  // Dispose the first listener.
  list[0].dispose()

  ee.emit('foo')
  expect(fn1).toBeCalledTimes(1)
  expect(fn2).toBeCalledTimes(2)

  // Dispose the second listener.
  list[1].dispose()

  ee.emit('foo')
  expect(fn2).toBeCalledTimes(2)
})

test('disposables can be collected for listener maps', () => {
  let ee = new EE<A>()
  let list: Array<{ dispose(): void }> = []
  let foo = jest.fn()
  ee.on({ foo }, list)
  ee.emit('foo')

  // Dispose the listener.
  list[0].dispose()

  ee.emit('foo')
  expect(foo).toBeCalledTimes(1)
})

/**
 * Loose event names
 */

test('loose event names', () => {
  interface B {
    [type: string]: () => number
  }
  let ee = new EE<B>()
  let result: number | void = ee.emit('whatever')
  expect(result).toBe(undefined)
})

/**
 * Static functions
 */

describe('has(ee, "*")', () => {
  it('returns true if "ee" has any listeners', () => {
    let ee = new EE<A>()
    expect(EE.has(ee, '*')).toBeFalsy()

    let foo = ee.on('foo', () => {})
    expect(EE.has(ee, '*')).toBeTruthy()

    ee.off('foo', foo)
    expect(EE.has(ee, '*')).toBeFalsy()

    ee.on('bar', () => {})
    expect(EE.has(ee, '*')).toBeTruthy()
  })
})

describe('has(ee, key)', () => {
  it('returns true if "ee" has any listeners for the given event key', () => {
    let ee = new EE<A>()
    expect(EE.has(ee, 'foo')).toBeFalsy()
    expect(EE.has(ee, 'bar')).toBeFalsy()

    let foo = ee.on('foo', () => {})
    expect(EE.has(ee, 'foo')).toBeTruthy()
    expect(EE.has(ee, 'bar')).toBeFalsy()

    ee.off('foo', foo)
    expect(EE.has(ee, 'foo')).toBeFalsy()
    expect(EE.has(ee, 'bar')).toBeFalsy()

    ee.on('bar', () => {})
    expect(EE.has(ee, 'foo')).toBeFalsy()
    expect(EE.has(ee, 'bar')).toBeTruthy()
  })
})

describe('keys(ee)', () => {
  it('returns an array of event keys that have listeners', () => {
    let ee = new EE<A>()
    expect(EE.keys(ee)).toEqual([])

    ee.on('foo', () => {})
    expect(EE.keys(ee)).toEqual(['foo'])

    ee.on('bar', () => {})
    expect(EE.keys(ee)).toEqual(['foo', 'bar'])
  })
})

describe('unhandle(ee, key, listener)', () => {
  it('handles an event when no other listeners exist', () => {
    let ee = new EE<A>()
    let foo = jest.fn()
    EE.unhandle(ee, 'foo', foo)

    ee.emit('foo')
    expect(foo).toBeCalledTimes(1)

    let fn = ee.on('foo', jest.fn())
    ee.emit('foo')
    expect(fn).toBeCalledTimes(1)
    expect(foo).toBeCalledTimes(1)

    ee.off('foo', fn)
    ee.emit('foo')
    expect(foo).toBeCalledTimes(2)
  })
})

/**
 * _onEventHandled && _onEventUnhandled
 */

class Foo extends EE<A> {
  handled: jest.Mock
  unhandled: jest.Mock

  constructor() {
    super()
    this.handled = jest.fn()
    this.unhandled = jest.fn()
  }

  _onEventHandled<T extends keyof A>(type: T): void {
    this.handled()
  }

  _onEventUnhandled<T extends keyof A>(type: T): void {
    this.unhandled()
  }
}

test('on() triggers _onEventHandled()', () => {
  let ee = new Foo()
  ee.on('foo', () => {})
  expect(ee.handled).toBeCalled()
})

test('on({}) triggers _onEventHandled()', () => {
  let ee = new Foo()
  ee.on({
    foo: () => {},
  })
  expect(ee.handled).toBeCalled()
})

test('one() triggers _onEventHandled()', () => {
  let ee = new Foo()
  ee.one('foo', () => {})
  expect(ee.handled).toBeCalled()
})

test('one({}) triggers _onEventHandled()', () => {
  let ee = new Foo()
  ee.one({
    foo: () => {},
  })
  expect(ee.handled).toBeCalled()
})

test('off() triggers _onEventUnhandled()', () => {
  let ee = new Foo()
  let fn = () => {}
  ee.on('foo', fn)
  ee.off('foo', fn)
  expect(ee.unhandled).toBeCalled()
  ee.on('foo', fn)
  ee.off('foo')
  expect(ee.unhandled).toBeCalledTimes(2)
  ee.on('foo', fn)
  ee.off('*')
  expect(ee.unhandled).toBeCalledTimes(3)
})

test('emit() triggers _onEventUnhandled()', () => {
  let ee = new Foo()
  ee.one('foo', () => {})
  ee.emit('foo')
  expect(ee.unhandled).toBeCalled()
})

import { EventEmitter as EE } from './ee'

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
  ee.on('bar', () => undefined)
  ee.on('bar', () => 1)
  ee.on('bar', () => undefined)
  ee.on('bar', () => 2)
  ee.on('bar', () => undefined)
  expect(ee.emit('bar', 1, 2)).toBe(2)
})

/**
 * One-time listeners
 */

test('add a one-time listener', () => {
  let ee = new EE<A>()
  let fn = jest.fn()
  ee.on('foo', () => null)
  ee.one('foo', fn)
  ee.on('foo', () => null)
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
  ee.on('foo', () => null)
  ee.one('foo', fn)
  ee.on('foo', () => null)
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
  ee.on('foo', () => null)
  ee.on('foo', fn)
  ee.on('foo', () => null)
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
  ee.on('foo', () => null)
  ee.off('foo', fn)
  ee.emit('foo')
  expect(fn).toHaveBeenCalledTimes(0)
  expect(EE.count(ee, 'foo')).toBe(1)
})

test('remove the last listener of an event', () => {
  let ee = new EE<A>()
  let fn = jest.fn()
  ee.on('foo', () => null)
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
  ee.on('foo', () => null)
  ee.on('foo', fn)
  ee.on('foo', () => null)
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
  ee.off('foo', () => null)
  ee.emit('foo')
  expect(fn).toHaveBeenCalledTimes(1)
})

/**
 * Listeners iterable
 */

test('iterate over listeners', () => {
  let ee = new EE<A>()
  let fn = jest.fn((a, b) => a + b)
  ee.on('bar', fn)
  for (let listener of ee.listeners('bar')) {
    expect(listener(1, 2)).toBe(3)
  }
})

/**
 * Loose event names
 */

test('loose event names', () => {
  interface B {
    [type: string]: () => number
  }
  let ee = new EE<B>()
  let result: number|void = ee.emit('whatever')
  expect(result).toBe(undefined)
})

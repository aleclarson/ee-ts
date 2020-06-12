/* tslint:disable:no-empty */
import { EventEmitter } from '../src/ee'

interface TestEvents {
  foo(): void
  bar(a: number, b: number): number
}

const EE = () => new EventEmitter<TestEvents>()
const noop = () => () => {}
const once = (fn?: Function) =>
  jest.fn((...args: any[]) => (fn && fn(...args), false))

test('falsy listeners', () => {
  let ee = EE()
  ee.on('foo', undefined)
  ee.on({ foo: null })
  expect(ee.getListeners()).toEqual({})
})

/**
 * Recurring listeners
 */

test('add a recurring listener', () => {
  let ee = EE()
  let fn = jest.fn()
  expect(ee.on('foo', fn)).toBe(fn)
  ee.emit('foo')
  expect(fn.mock.calls.length).toBe(1)
  ee.emit('foo')
  expect(fn.mock.calls.length).toBe(2)
})

test('add multiple recurring listeners', () => {
  let ee = EE()
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

/**
 * One-time listeners
 */

test('add a one-time listener', () => {
  let ee = EE()
  let fn = once()
  ee.on('foo', noop())
  ee.on('foo', fn)
  ee.on('foo', noop())
  ee.emit('foo')
  expect(ee.getListeners('foo').size).toBe(2)
  expect(fn).toHaveBeenCalledTimes(1)
  ee.emit('foo')
  expect(fn).toHaveBeenCalledTimes(1)
})

test('add multiple one-time listeners', () => {
  let ee = EE()
  let f1 = ee.on('foo', once())
  let f2 = ee.on('foo', once())
  ee.emit('foo')
  ee.emit('foo')
  expect(f1).toHaveBeenCalledTimes(1)
  expect(f2).toHaveBeenCalledTimes(1)
  expect(ee.getListeners('foo').size).toBe(0)
})

test('remove a one-time listener', () => {
  let ee = EE()
  let fn = once()
  ee.on('foo', noop())
  ee.on('foo', fn)
  ee.on('foo', noop())
  ee.off('foo', fn)
  ee.emit('foo')
  expect(fn).toHaveBeenCalledTimes(0)
  expect(ee.getListeners('foo').size).toBe(2)
})

/**
 * Removed listeners
 */

test('remove a recurring listener', () => {
  let ee = EE()
  let fn = jest.fn()
  ee.on('foo', noop())
  ee.on('foo', fn)
  ee.on('foo', noop())
  ee.off('foo', fn)
  ee.emit('foo')
  expect(fn).toHaveBeenCalledTimes(0)
  expect(ee.getListeners('foo').size).toBe(2)
})

test('remove the only listener of an event', () => {
  let ee = EE()
  let fn = jest.fn()
  ee.on('foo', fn)
  ee.off('foo', fn)
  ee.emit('foo')
  expect(fn).toHaveBeenCalledTimes(0)
  expect(ee.getListeners('foo').size).toBe(0)
})

test('remove the first listener of an event', () => {
  let ee = EE()
  let fn = jest.fn()
  ee.on('foo', fn)
  ee.on('foo', noop())
  ee.off('foo', fn)
  ee.emit('foo')
  expect(fn).toHaveBeenCalledTimes(0)
  expect(ee.getListeners('foo').size).toBe(1)
})

test('remove the last listener of an event', () => {
  let ee = EE()
  let fn = jest.fn()
  ee.on('foo', noop())
  ee.on('foo', fn)
  ee.off('foo', fn)
  ee.emit('foo')
  expect(fn).toHaveBeenCalledTimes(0)
  expect(ee.getListeners('foo').size).toBe(1)
})

test('remove all listeners of an event', () => {
  let ee = EE()
  let fn = jest.fn()
  ee.on('foo', () => fn())
  ee.on('foo', () => fn())
  ee.on('foo', () => fn())
  ee.off('foo')
  ee.emit('foo')
  expect(fn).toHaveBeenCalledTimes(0)
  expect(ee.getListeners('foo').size).toBe(0)
})

test('remove all listeners of all events', () => {
  let ee = EE()
  let fn = jest.fn()
  ee.on('foo', () => fn())
  ee.on('bar', () => fn())
  ee.off('*')
  ee.emit('foo')
  ee.emit('bar', 1, 2)
  expect(fn).toHaveBeenCalledTimes(0)
  expect(ee.getListeners('foo').size).toBe(0)
  expect(ee.getListeners('bar').size).toBe(0)
})

test('remove current listener during emit', () => {
  let ee = EE()
  let fn = jest.fn(() => {
    ee.off('foo', fn)
  })
  ee.on('foo', noop())
  ee.on('foo', fn)
  ee.on('foo', noop())
  ee.emit('foo')
  expect(fn).toHaveBeenCalledTimes(1)
  expect(ee.getListeners('foo').size).toBe(2)
  ee.emit('foo')
  expect(fn).toHaveBeenCalledTimes(1)
})

test('remove pending listener during emit', () => {
  let ee = EE()
  let fn = jest.fn()
  ee.on('foo', () => ee.off('foo', fn))
  ee.on('foo', fn)
  ee.emit('foo')
  expect(fn).toHaveBeenCalledTimes(0)
  expect(ee.getListeners('foo').size).toBe(1)
})

test('remove finished listener during emit', () => {
  let ee = EE()
  let fn = jest.fn()
  ee.on('foo', fn)
  ee.on('foo', () => ee.off('foo', fn))
  ee.emit('foo')
  expect(fn).toHaveBeenCalledTimes(1)
  expect(ee.getListeners('foo').size).toBe(1)
  ee.emit('foo')
  expect(fn).toHaveBeenCalledTimes(1)
})

test('remove a listener that was added twice', () => {
  let ee = EE()
  let fn = jest.fn()
  ee.on('foo', fn)
  ee.on('foo', () => ee.off('foo', fn))
  ee.on('foo', fn)
  ee.emit('foo')
  expect(fn).toHaveBeenCalledTimes(1)
  expect(ee.getListeners('foo').size).toBe(1)
  ee.emit('foo')
  expect(fn).toHaveBeenCalledTimes(1)
})

test('remove a listener that was never added', () => {
  let ee = EE()
  let fn = jest.fn()
  ee.on('foo', fn)
  ee.off('foo', noop())
  ee.emit('foo')
  expect(fn).toHaveBeenCalledTimes(1)
})

/**
 * Loose event names
 */

test('loose event names', () => {
  interface B {
    [type: string]: () => number
  }
  let ee = new EventEmitter<B>()
  let result: number | void = ee.emit('whatever')
  expect(result).toBe(undefined)
})

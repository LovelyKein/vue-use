import { afterEach, describe, expect, it, vi } from 'vitest'

import { debounce } from '../debounce'

describe('debounce', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('should throw error if fn is not a function', () => {
    expect(() => debounce(null as any, 100)).toThrow('fn must be a function')
  })

  it('should throw error if delay is invalid', () => {
    expect(() => debounce(() => {}, -1)).toThrow('delay must be a positive number')
  })

  it('should debounce function calls', () => {
    vi.useFakeTimers()
    const fn = vi.fn()
    const debouncedFn = debounce(fn, 100)

    debouncedFn()
    debouncedFn()
    debouncedFn()

    // 还没过 delay 时间，应该没有执行
    expect(fn).not.toHaveBeenCalled()

    // 推进 50ms，依然没执行
    vi.advanceTimersByTime(50)
    expect(fn).not.toHaveBeenCalled()

    // 再执行一次，重新计时
    debouncedFn()

    // 再推进 50ms，加起来 100ms，但因为被重置了，依然不执行
    vi.advanceTimersByTime(50)
    expect(fn).not.toHaveBeenCalled()

    // 再推进 50ms，此时距离最后一次调用满 100ms，应该执行 1 次
    vi.advanceTimersByTime(50)
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('should execute immediately if immediate is true', () => {
    vi.useFakeTimers()
    const fn = vi.fn()
    const debouncedFn = debounce(fn, 100, { immediate: true })

    debouncedFn()
    // immediate 为 true，第一次调用立刻执行
    expect(fn).toHaveBeenCalledTimes(1)

    debouncedFn()
    debouncedFn()

    // 还没过 delay 时间，不应该额外执行
    expect(fn).toHaveBeenCalledTimes(1)

    // 推进 100ms
    vi.advanceTimersByTime(100)

    // 因为 immediate 是 true，定时器结束时只是清空 timer 标识，并不再次执行
    expect(fn).toHaveBeenCalledTimes(1)

    // 等到 timer 被清空后，再次调用又会立即执行
    debouncedFn()
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('should preserve "this" context and arguments', () => {
    vi.useFakeTimers()
    let context: any
    let args: any[] = []

    const obj = {
      value: 42,
      fn: debounce(function (this: any, ...fnArgs: any[]) {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        context = this
        args = fnArgs
      }, 100)
    }

    obj.fn('arg1', 'arg2')
    vi.advanceTimersByTime(100)

    expect(context).toBe(obj)
    expect(args).toEqual(['arg1', 'arg2'])
  })
})

import { describe, expect, it, vi } from 'vitest'

import { throttle } from '../throttle'

describe('throttle', () => {
  it('should throw error if fn is not a function', () => {
    expect(() => throttle(null as any, 100)).toThrow('fn must be a function')
  })

  it('should throw error if delay is invalid', () => {
    expect(() => throttle(() => {}, -1)).toThrow('delay must be a positive number')
  })

  it('should throttle function calls', () => {
    vi.useFakeTimers()
    const fn = vi.fn()
    const throttledFn = throttle(fn, 100)

    throttledFn()
    throttledFn()
    throttledFn()

    expect(fn).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(100)
    throttledFn()
    expect(fn).toHaveBeenCalledTimes(2)
  })
})

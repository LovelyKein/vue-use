import { describe, expect, it } from 'vitest'

import { useCycleList } from '../useCycleList'

describe('useCycleList', () => {
  it('should throw error if options is empty', () => {
    expect(() => useCycleList([])).toThrow('options must be an array and not empty')
  })

  it('should initialize with the first item if no initialValue is provided', () => {
    const { current } = useCycleList(['a', 'b', 'c'])
    expect(current.value).toBe('a')
  })

  it('should initialize with initialValue if provided', () => {
    const { current } = useCycleList(['a', 'b', 'c'], 'b')
    expect(current.value).toBe('b')
  })

  it('should fallback to first item if initialValue is not in options', () => {
    const { current } = useCycleList(['a', 'b', 'c'], 'd')
    expect(current.value).toBe('a')
  })

  it('should toggle to the next item', () => {
    const { current, toggle } = useCycleList(['a', 'b', 'c'])
    expect(current.value).toBe('a')
    toggle()
    expect(current.value).toBe('b')
    toggle()
    expect(current.value).toBe('c')
  })

  it('should cycle back to the first item', () => {
    const { current, toggle } = useCycleList(['a', 'b', 'c'], 'c')
    expect(current.value).toBe('c')
    toggle()
    expect(current.value).toBe('a')
  })
})

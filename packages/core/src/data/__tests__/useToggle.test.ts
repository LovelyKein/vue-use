import { describe, expect, it } from 'vitest'

import { useToggle } from '../useToggle'

describe('useToggle', () => {
  it('should initialize with false by default', () => {
    const { current } = useToggle()
    expect(current.value).toBe(false)
  })

  it('should toggle boolean values', () => {
    const { current, toggle } = useToggle()
    expect(current.value).toBe(false)
    toggle()
    expect(current.value).toBe(true)
    toggle()
    expect(current.value).toBe(false)
  })

  it('should support custom values', () => {
    const { current, toggle } = useToggle('ON', 'OFF')
    expect(current.value).toBe('OFF') // fallback to falsyValue if no initialValue provided
    toggle()
    expect(current.value).toBe('ON')
    toggle()
    expect(current.value).toBe('OFF')
  })

  it('should initialize with custom initialValue', () => {
    const { current } = useToggle('ON', 'OFF', 'ON')
    expect(current.value).toBe('ON')
  })

  it('should support override value', () => {
    const { current, toggle } = useToggle()
    expect(current.value).toBe(false)
    toggle(true)
    expect(current.value).toBe(true)
    toggle(true)
    expect(current.value).toBe(true)
    toggle(false)
    expect(current.value).toBe(false)
  })
})

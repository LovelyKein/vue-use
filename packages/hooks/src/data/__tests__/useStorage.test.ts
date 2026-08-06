import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

import { useStorage } from '../useStorage'

describe('useStorage', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
    vi.useFakeTimers()
  })

  it('should initialize with initialValue and write to localStorage', () => {
    const { value } = useStorage('test_init', { initialValue: 'default_value' })
    expect(value.value).toBe('default_value')

    const raw = localStorage.getItem('useStorage#test_init')
    expect(raw).not.toBeNull()
    const parsed = JSON.parse(raw!)
    expect(parsed.value).toBe('default_value')
  })

  it('should read existing value if present and not expired', () => {
    const storageKey = 'useStorage#test_read'
    localStorage.setItem(storageKey, JSON.stringify({ value: 'existing_value', timestamp: Date.now() + 10000 }))
    const { value } = useStorage('test_read', { initialValue: 'default_value' })
    expect(value.value).toBe('existing_value')
  })

  it('should fallback to initialValue if existing value is expired', () => {
    const storageKey = 'useStorage#test_expired'
    localStorage.setItem(storageKey, JSON.stringify({ value: 'existing_value', timestamp: Date.now() - 1000 }))
    const { value } = useStorage('test_expired', { initialValue: 'default_value' })
    expect(value.value).toBe('default_value')
    expect(localStorage.getItem(storageKey)).toBeNull()
  })

  it('should update storage when value.value is mutated directly', async () => {
    const { value } = useStorage('test_mutate', { initialValue: 'initial' })
    value.value = 'mutated_value'

    await nextTick()

    const raw = localStorage.getItem('useStorage#test_mutate')
    const parsed = JSON.parse(raw!)
    expect(parsed.value).toBe('mutated_value')
  })

  it('should support set and remove methods', () => {
    const { value, set, remove } = useStorage('test_methods', { initialValue: 'initial' })

    set('new_value')
    expect(value.value).toBe('new_value')
    expect(JSON.parse(localStorage.getItem('useStorage#test_methods')!).value).toBe('new_value')

    remove()
    expect(value.value).toBe('initial')
    expect(localStorage.getItem('useStorage#test_methods')).toBeNull()
  })

  it('should support session storage', () => {
    useStorage('test_session', { initialValue: 'session_val', mode: 'session' })
    expect(sessionStorage.getItem('useStorage#test_session')).not.toBeNull()
    expect(localStorage.getItem('useStorage#test_session')).toBeNull()
  })
})

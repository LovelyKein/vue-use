import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, nextTick } from 'vue'

import { useTitle } from '../useTitle'

describe('useTitle', () => {
  afterEach(() => {
    document.title = ''
    vi.restoreAllMocks()
  })

  it('should set title immediately if provided', () => {
    const title = useTitle('New Title')
    expect(title.value).toBe('New Title')
    expect(document.title).toBe('New Title')
  })

  it('should update document.title when ref changes', async () => {
    const title = useTitle('Initial Title')
    expect(document.title).toBe('Initial Title')

    title.value = 'Updated Title'
    await nextTick()

    expect(document.title).toBe('Updated Title')
  })

  it('should backtrack to original title when unmounted if backTrack is true', async () => {
    document.title = 'Original Title'

    const Component = defineComponent({
      setup() {
        useTitle('New Title', { backTrack: true })
        return () => null
      }
    })

    const wrapper = mount(Component)
    expect(document.title).toBe('New Title')

    wrapper.unmount()

    expect(document.title).toBe('Original Title')
  })

  it('should observe document.title changes', async () => {
    const title = useTitle('Initial', { observe: true })

    document.title = 'External Change'

    await new Promise((resolve) => setTimeout(resolve, 50))

    expect(title.value).toBe('External Change')
  })
})

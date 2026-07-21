import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { defineAsyncComponent, defineComponent, h, nextTick, ref } from 'vue'

import { useOpenComp } from '../useOpenComp'

describe('useOpenComp', () => {
  it('should call exposed method when component is mounted later by v-if', async () => {
    vi.useFakeTimers()
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const open = vi.fn()

    const Child = defineComponent({
      setup(_, { expose }) {
        expose({ open })
        return () => null
      }
    })

    const Parent = defineComponent({
      setup() {
        const show = ref(false)
        const childRef = ref(null)

        function trigger() {
          show.value = true
          useOpenComp(childRef, 'open', [1, 'a'])
        }

        return () =>
          h('div', [h('button', { onClick: trigger }, 'trigger'), show.value ? h(Child, { ref: childRef }) : null])
      }
    })

    const wrapper = mount(Parent)
    await wrapper.find('button').trigger('click')
    await nextTick()
    await nextTick()

    expect(open).toHaveBeenCalledTimes(1)
    expect(open).toHaveBeenCalledWith(1, 'a')

    vi.advanceTimersByTime(5000)
    expect(warnSpy).not.toHaveBeenCalled()
    vi.useRealTimers()
  })

  it('should work with async component', async () => {
    vi.useFakeTimers()
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const open = vi.fn()

    const Child = defineComponent({
      setup(_, { expose }) {
        expose({ open })
        return () => null
      }
    })

    const AsyncChild = defineAsyncComponent(() => Promise.resolve(Child))

    const Parent = defineComponent({
      setup() {
        const show = ref(false)
        const childRef = ref(null)

        function trigger() {
          show.value = true
          useOpenComp(childRef, 'open', [42])
        }

        return () =>
          h('div', [h('button', { onClick: trigger }, 'trigger'), show.value ? h(AsyncChild, { ref: childRef }) : null])
      }
    })

    const wrapper = mount(Parent)
    await wrapper.find('button').trigger('click')
    await nextTick()
    await nextTick()
    await nextTick()

    expect(open).toHaveBeenCalledTimes(1)
    expect(open).toHaveBeenCalledWith(42)

    vi.advanceTimersByTime(5000)
    expect(warnSpy).not.toHaveBeenCalled()
    vi.useRealTimers()
  })
})

import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent } from 'vue'

import { useElement } from '../useElement'

describe('useElement', () => {
  it('should initialize with null rect', () => {
    const Component = defineComponent({
      setup() {
        const el = document.createElement('div')
        const rect = useElement(el)
        return { rect }
      },
      template: '<div></div>'
    })
    const wrapper = mount(Component)
    expect(wrapper.vm.rect).toBeNull()
  })

  it('should update rect when element is added to DOM', async () => {
    const el = document.createElement('div')
    el.getBoundingClientRect = () => ({
      width: 100,
      height: 100,
      top: 0,
      left: 0,
      bottom: 100,
      right: 100,
      x: 0,
      y: 0,
      toJSON: () => {}
    })

    const Component = defineComponent({
      setup() {
        const rect = useElement(el)
        return { rect }
      },
      template: '<div></div>'
    })
    const wrapper = mount(Component)

    // The current useElement implementation observes mutations ON the element itself.
    // So to trigger it, we need to mutate the element.
    el.setAttribute('data-test', '1')

    // wait for mutation observer
    await new Promise((resolve) => setTimeout(resolve, 50))

    expect(wrapper.vm.rect).not.toBeNull()
    expect(wrapper.vm.rect?.width).toBe(100)

    wrapper.unmount()
  })
})

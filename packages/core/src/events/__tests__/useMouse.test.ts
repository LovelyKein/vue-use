import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent } from 'vue'

import { useMouse } from '../useMouse'

describe('useMouse', () => {
  it('should track mouse position', async () => {
    const Component = defineComponent({
      setup() {
        const mouse = useMouse()
        return { mouse }
      },
      template: '<div></div>'
    })
    const wrapper = mount(Component)

    expect(wrapper.vm.mouse.x.value).toBe(0)
    expect(wrapper.vm.mouse.y.value).toBe(0)

    const event = new MouseEvent('mousemove', {
      clientX: 100,
      clientY: 200
    })
    document.dispatchEvent(event)

    // Because it's throttled by 200ms
    await new Promise((resolve) => setTimeout(resolve, 250))

    expect(wrapper.vm.mouse.x.value).toBe(100)
    expect(wrapper.vm.mouse.y.value).toBe(200)

    wrapper.unmount()
  })
})

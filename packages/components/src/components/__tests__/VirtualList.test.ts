import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

import VirtualList from '../VirtualList.vue'

// 生成定长测试数据
const createData = (count: number) => Array.from({ length: count }, (_, i) => ({ id: i, text: `item-${i}` }))

describe('VirtualList', () => {
  beforeEach(() => {
    // happy-dom 不做真实布局，clientHeight 默认为 0
    // mock 容器可视区域高度，使虚拟滚动的可见项计算可被触发
    vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(300)
    // rAF 同步执行，便于在滚动事件后立即断言渲染结果
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      cb(0)
      return 0
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('renders container and computes total height from data length', async () => {
    const data = createData(100)
    const wrapper = mount(VirtualList, {
      props: { data, itemHeight: 50 }
    })
    await nextTick()

    expect(wrapper.find('.virtual-list-container').exists()).toBe(true)
    // totalHeight = dataLength * (itemHeight + gap) = 100 * 50 = 5000
    expect(wrapper.find('.list-phantom').attributes('style')).toContain('height: 5000px')
  })

  it('only renders visible items plus buffer', async () => {
    const data = createData(100)
    const wrapper = mount(VirtualList, {
      props: { data, itemHeight: 50, buffer: 2 }
    })
    await nextTick()

    // visibleCount = ceil(300 / 50) = 6
    // startIndex = max(0, 0 - 2) = 0, endIndex = min(99, 0 + 6 + 2) = 8
    // 渲染项数 = endIndex - startIndex + 1 = 9
    expect(wrapper.findAll('.list-item')).toHaveLength(9)
  })

  it('passes each item to the default slot', async () => {
    const data = createData(10)
    const wrapper = mount(VirtualList, {
      props: { data, itemHeight: 50 },
      slots: {
        default: '<template #default="{ item }"><span class="cell">{{ item.text }}</span></template>'
      }
    })
    await nextTick()

    expect(wrapper.find('.cell').text()).toBe('item-0')
  })

  it('updates the visible window after scrolling', async () => {
    const data = createData(1000)
    const wrapper = mount(VirtualList, {
      props: { data, itemHeight: 50, buffer: 0 }
    })
    await nextTick()

    // 模拟滚动到 scrollTop = 500
    const container = wrapper.find('.virtual-list-container').element as HTMLElement
    vi.spyOn(container, 'scrollTop', 'get').mockReturnValue(500)
    container.dispatchEvent(new Event('scroll'))
    await nextTick()

    // scrollTop=500, itemHeight=50 => visibleIndex = 10
    // buffer=0 => startIndex = 10，第一个渲染项的 data-index 应为 10
    expect(wrapper.find('.list-item').attributes('data-index')).toBe('10')
  })
})

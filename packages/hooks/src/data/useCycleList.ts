import type { Ref } from 'vue'
import { ref } from 'vue'

export interface UseCycleListReturn<T> {
  current: Ref<T>
  toggle: () => void
}

/**
 * 循环切换数组中的元素
 * @param options 循环切换的数组
 * @param initialValue 初始值，默认取数组第一项
 * @returns 包含当前值和切换函数的对象
 */
export function useCycleList<T>(options: T[], initialValue?: T): UseCycleListReturn<T> {
  if (!Array.isArray(options) || options.length === 0) {
    throw new Error('options must be an array and not empty')
  }
  // 如果初始值不在数组中，默认取数组第一项
  const init = initialValue !== undefined ? initialValue : options[0]
  const current = ref<T>(options.includes(init) ? init : options[0])

  const toggle = (): void => {
    const currentIndex = options.indexOf(current.value)
    // 如果找不到，或者已经是最后一个，切回第一个；否则切到下一个
    const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % options.length

    current.value = options[nextIndex]
  }

  return {
    current: current as Ref<T>,
    toggle
  }
}

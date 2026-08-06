import type { Ref } from 'vue'
import { ref } from 'vue'

export interface UseToggleReturn<T = boolean> {
  current: Ref<T>
  toggle: (overrideValue?: T) => void
}

// 默认 boolean 切换
export function useToggle(): UseToggleReturn<boolean>
// 自定义两个值的切换
export function useToggle<T>(truthyValue: T, falsyValue: T, initialValue?: T): UseToggleReturn<T>

export function useToggle<T>(truthyValue: T = true as T, falsyValue: T = false as T, initialValue: T = falsyValue) {
  const options: T[] = [truthyValue, falsyValue]

  const current = ref(options.includes(initialValue) ? initialValue : options[1])

  function toggle(overrideValue?: T): void {
    if (arguments.length && options.includes(overrideValue as T)) {
      current.value = overrideValue as T
      return
    }
    current.value = current.value === truthyValue ? falsyValue : truthyValue
  }

  return { current, toggle }
}

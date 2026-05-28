import type { Ref } from 'vue-demi'
import { ref } from 'vue-demi'

import { UseToggleReturn } from './types'

export function useToggle<T = boolean>(options: T[] = [false as T, true as T], defaultIndex = 0): UseToggleReturn<T> {
  const initialValue = options[defaultIndex]

  const value = ref<T>(initialValue)

  const toggle = (): void => {
    const index = options.indexOf(value.value) === 0 ? 1 : 0
    value.value = options[index]
  }

  return {
    value: value as Ref<T>,
    toggle
  }
}

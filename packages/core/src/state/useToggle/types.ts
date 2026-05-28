import type { Ref } from 'vue-demi'
export interface UseToggleReturn<T> {
  value: Ref<T>
  toggle: () => void
}

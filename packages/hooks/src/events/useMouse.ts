import { onMounted, onUnmounted, type Ref, ref } from 'vue'

import { throttle } from '../utils/throttle'

export interface UseMouseResult {
  x: Ref<number>
  y: Ref<number>
}

export function useMouse(): UseMouseResult {
  const x = ref(0)
  const y = ref(0)

  onMounted(() => {
    document.addEventListener('mousemove', handleMouseMove)
  })
  onUnmounted(() => {
    document.removeEventListener('mousemove', handleMouseMove)
  })
  const handleMouseMove = throttle((e: MouseEvent) => {
    x.value = e.clientX
    y.value = e.clientY
  }, 200)

  return {
    x,
    y
  }
}

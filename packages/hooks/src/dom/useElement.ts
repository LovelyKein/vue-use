import { onMounted, onUnmounted, type Ref, ref } from 'vue'

export interface UseElementResult {
  element: Ref<HTMLElement | null>
}

export function useElement(element: HTMLElement) {
  const rect = ref<DOMRect | null>(null)

  const updateRect = () => {
    rect.value = element.getBoundingClientRect()
  }

  let observer: MutationObserver | null = null

  onMounted(() => {
    observer = new MutationObserver((entries) => {
      const [entry] = entries
      const isAdded = entry.target === element
      if (isAdded) {
        updateRect()
      }
    })
    observer.observe(element, { childList: true, attributes: true })
  })
  onUnmounted(() => {
    observer?.disconnect()
    observer = null
  })

  return rect
}

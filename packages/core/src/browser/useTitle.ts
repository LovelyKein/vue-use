import { isRef, onBeforeUnmount, type Ref, ref, watch } from 'vue'

export interface UseTitleOptions {
  /**
   * 当组件卸载时是否恢复之前的标题
   * @default false
   */
  backTrack?: boolean
  /**
   * 是否监听外部对 document.title 的修改并同步到 ref
   * @default false
   */
  observe?: boolean
}

export function useTitle(initialTitle?: string | Ref<string | null | undefined> | null, options: UseTitleOptions = {}) {
  if (typeof options !== 'object' && options !== null) {
    throw new Error('options must be an object')
  }
  const { backTrack = false, observe = false } = options

  // 确保在浏览器环境中使用
  const isBrowser = typeof document !== 'undefined'
  // 保存原始标题
  const originalTitle = isBrowser ? document.title : ''

  const title = isRef(initialTitle) ? initialTitle : ref(initialTitle ?? originalTitle)

  let observer: MutationObserver | undefined

  if (isBrowser) {
    watch(
      title,
      (newTitle) => {
        if (typeof newTitle === 'string' && newTitle !== document.title) {
          document.title = newTitle
        }
      },
      { immediate: true }
    )

    if (observe) {
      observer = new MutationObserver(() => {
        if (document.title !== title.value) {
          title.value = document.title
        }
      })

      const titleElement = document.querySelector('title')
      if (titleElement) {
        observer.observe(titleElement, { childList: true })
      } else {
        observer.observe(document.head, { childList: true, subtree: true })
      }
    }
  }

  if (backTrack || observer) {
    onBeforeUnmount(() => {
      if (backTrack && isBrowser) {
        document.title = originalTitle
      }
      if (observer) {
        observer.disconnect()
      }
    })
  }

  return title
}

import type { ComponentPublicInstance, Ref } from 'vue'
import { watch } from 'vue'

/**
 * 使用子组件的方法,支持异步组件挂载
 * @param instanceRef 组件实例引用
 * @param funcName 子组件暴露的方法名
 * @param params 方法参数列表
 */
export function useOpenComp<T extends ComponentPublicInstance = ComponentPublicInstance>(
  instanceRef: Ref<T | null | undefined>,
  funcName: string,
  params: Array<unknown> = []
) {
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  const instance = instanceRef.value
  if (instance) {
    const method = (instance as Record<string, unknown>)[funcName]
    if (typeof method === 'function') {
      timeoutId && clearTimeout(timeoutId)
      ;(method as (...args: Array<unknown>) => unknown).apply(instance, params)
    }
    return
  }

  const stopWatch = watch(
    instanceRef,
    async (instance) => {
      if (instance) {
        const method = (instance as Record<string, unknown>)[funcName]
        if (typeof method !== 'function') {
          console.warn(`useOpenComp: ${funcName} is not a function`)
          stopWatch()
          return
        }

        stopWatch()
        ;(method as (...args: Array<unknown>) => unknown).apply(instance, params)
      }
    },
    { immediate: true, flush: 'post' }
  )

  // 超时控制
  timeoutId = setTimeout(() => {
    timeoutId && clearTimeout(timeoutId)
    console.warn(`useOpenComp: ${instanceRef.value?.$options.name} load timeout`)
    stopWatch()
  }, 5000)
}

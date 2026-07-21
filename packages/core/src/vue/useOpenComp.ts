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

  function stopTimeout() {
    if (!timeoutId) return
    clearTimeout(timeoutId)
    timeoutId = null
  }

  function execution(instance: T) {
    const method = (instance as Record<string, unknown>)[funcName]
    if (typeof method !== 'function') {
      console.warn(`useOpenComp: ${funcName} is not a function`)
      return
    }
    ;(method as (...args: Array<unknown>) => unknown).apply(instance, params)
  }

  const instance = instanceRef.value
  if (instance) {
    execution(instance)
    return
  }

  const stopWatch = watch(
    instanceRef,
    (instance) => {
      if (instance) {
        stopTimeout()
        stopWatch()

        execution(instance)
      }
    },
    { immediate: true, flush: 'post' }
  )

  // 超时控制
  timeoutId = setTimeout(() => {
    stopTimeout()
    stopWatch()
    const compName = (instanceRef.value as unknown as { $?: { type?: { name?: string } } })?.$?.type?.name
    console.warn(`useOpenComp: ${compName ?? 'Anonymous'} load timeout`)
  }, 5000)
}

export interface DebounceOptions {
  /**
   * 是否在延迟开始前立即执行一次
   * @default false
   */
  immediate?: boolean
}

type DebounceFn = (...args: any[]) => void

/**
 * 防抖函数
 * @param fn 要防抖的函数
 * @param delay 防抖时间间隔
 * @param options 防抖选项
 * @param options.immediate 是否在延迟开始前立即执行一次
 * @returns 防抖后的函数
 */
export function debounce<T extends DebounceFn>(
  fn: T,
  delay: number,
  options: DebounceOptions = {}
): (this: unknown, ...args: Parameters<T>) => void {
  if (typeof fn !== 'function') {
    throw new Error('fn must be a function')
  }
  if (typeof delay !== 'number' || delay < 0) {
    throw new Error('delay must be a positive number')
  }

  const { immediate = false } = options

  // 定时器
  let timer: ReturnType<typeof setTimeout> | null = null

  return function (this: unknown, ...args: Parameters<T>) {
    const isFirstCall = immediate && !timer
    if (isFirstCall) {
      fn.apply(this, args)
      return
    }

    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
      timer = null
    }, delay)
  }
}

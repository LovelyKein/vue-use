export interface ThrottleOptions {
  /**
   * 是否在开始时立即执行一次
   * @default true
   */
  immediate?: boolean
}

type ThrottleFn = (...args: any[]) => void

/**
 * 节流函数
 * @param fn 要节流的函数
 * @param delay 节流时间间隔
 * @param options 节流选项
 * @param options.immediate 是否在开始时立即执行一次
 * @returns 节流后的函数
 */
export function throttle<T extends ThrottleFn>(
  fn: T,
  delay: number
  // options: ThrottleOptions = {}
): (this: unknown, ...args: Parameters<T>) => void {
  if (typeof fn !== 'function') {
    throw new Error('fn must be a function')
  }
  if (typeof delay !== 'number' || delay <= 0) {
    throw new Error('delay must be a positive number')
  }

  // const { immediate = true } = options

  // 上次执行时间
  let last: number = 0

  return function (this: unknown, ...args: Parameters<T>) {
    // 当前执行时间
    const now = Date.now()

    if (now - last >= delay) {
      last = now
      return fn.apply(this, args)
    }
  }
}

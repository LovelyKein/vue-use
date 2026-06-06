type ThrottleFn = (...args: any[]) => void

/**
 * 节流函数
 * @param fn 要节流的函数
 * @param delay 节流时间间隔
 * @returns 节流后的函数
 */
export function throttle<T extends ThrottleFn>(fn: T, delay: number): (this: unknown, ...args: Parameters<T>) => void {
  if (typeof fn !== 'function') {
    throw new Error('fn must be a function')
  }
  if (typeof delay !== 'number' || delay <= 0) {
    throw new Error('delay must be a positive number')
  }

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

// // 定时器版本（不推荐）
// /**
//  * 节流函数（定时器版本）
//  * @param fn 要节流的函数
//  * @param delay 节流时间间隔
//  * @returns 节流后的函数
//  */
// export function throttleWithTimer<T extends ThrottleFn>(
//   fn: T,
//   delay: number
// ): (this: unknown, ...args: Parameters<T>) => void {
//   let timer: ReturnType<typeof setTimeout> | null = null

//   return function (this: unknown, ...args: Parameters<T>) {
//     if (timer) clearTimeout(timer)
//     timer = setTimeout(() => {
//       fn.apply(this, args)
//       timer = null
//     }, delay)
//   }
// }

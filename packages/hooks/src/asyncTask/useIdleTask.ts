type CallbackType<T = unknown> = (value: T) => void

type Task<T = unknown> = (...args: unknown[]) => T

function _runTask<T = unknown>(task: Task<T>, resolve: CallbackType<T>, reject: CallbackType): void {
  // safari 浏览器不支持 requestIdleCallback，可以使用requestAnimationFrame 代替
  // Date.now() - startTime 检查是否还有时间执行任务
  requestIdleCallback(
    (deadline) => {
      try {
        if (deadline && deadline.timeRemaining() > 5) {
          const result = task()
          resolve(result)
        } else {
          // 没有时间了，但是任务没有执行完，需要递归调用_runTask
          _runTask(task, resolve, reject)
        }
      } catch (error) {
        reject(error)
      }
    },
    { timeout: 2000 }
  )
}

/**
 * 运行一个耗时任务，异步执行任务，返回Promise
 * 要尽快完成任务，同时不要让页面产生卡顿
 * @param task 耗时任务函数
 */
export function useIdleTask<T = unknown>(task: Task<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    if (typeof task !== 'function') {
      reject(new Error('task must be a function'))
      return
    }
    _runTask(task, resolve, reject)
  })
}

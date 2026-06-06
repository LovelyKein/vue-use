import { computed, ref } from 'vue'

export type TaskMode = 'order' | 'priority'

export type Task = (...args: unknown[]) => Promise<unknown>
export interface TaskItem {
  task: Task
  resolve: (value?: unknown) => void
  reject: (reason?: Error) => void
  priority?: number
}

export function useTasks(concurrency = 6, mode: TaskMode = 'order') {
  const tasks: TaskItem[] = []

  const runningTasks = ref<number>(0)
  const remainTasks = ref<number>(0)

  const addTask = (task: Task, priority: number = 0): Promise<unknown> => {
    return new Promise((resolve, reject) => {
      if (typeof task !== 'function') task = () => Promise.resolve(task)
      tasks.push({ task, resolve, reject, priority })
      // 更新remainTasks
      remainTasks.value = tasks.length
      // 延迟到微任务：让同一同步块内的所有 addTask 都入队后再挑选，
      // 否则前 concurrency 个任务会立即抢占执行槽位，后入队的高优先级任务无法插队
      queueMicrotask(runTask)
    })
  }

  const getTask = (): TaskItem => {
    if (mode === 'order') {
      return tasks.shift()!
    } else {
      let maxIndex = 0
      let maxPriority = tasks[0].priority ?? 0
      for (let i = 1; i < tasks.length; i++) {
        const p = tasks[i].priority ?? 0
        if (p > maxPriority) {
          maxPriority = p
          maxIndex = i
        }
      }
      return tasks.splice(maxIndex, 1)[0]!
    }
  }

  const runTask = async () => {
    while (tasks.length && runningTasks.value < concurrency) {
      const { task, resolve, reject } = getTask()
      runningTasks.value++
      remainTasks.value = tasks.length
      try {
        // 执行任务
        const res = await task()
        resolve(res)
      } catch (error) {
        reject(error as Error)
      } finally {
        runningTasks.value--
        runTask()
      }
    }
  }

  return {
    addTask,
    remainCount: computed(() => remainTasks.value), // 只读
    runningCount: computed(() => runningTasks.value) // 只读
  }
}

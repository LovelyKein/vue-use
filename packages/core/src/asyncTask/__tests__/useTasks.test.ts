import { describe, expect, it } from 'vitest'

import { useTasks } from '../useTasks'

describe('useTasks', () => {
  it('should execute tasks in order by default', async () => {
    const { addTask } = useTasks(1, 'order')
    const results: number[] = []

    const task1 = () =>
      new Promise((resolve) =>
        setTimeout(() => {
          results.push(1)
          resolve(1)
        }, 10)
      )
    const task2 = () =>
      new Promise((resolve) =>
        setTimeout(() => {
          results.push(2)
          resolve(2)
        }, 5)
      )

    const p1 = addTask(task1)
    const p2 = addTask(task2)

    await Promise.all([p1, p2])
    expect(results).toEqual([1, 2])
  })

  it('should execute tasks based on priority', async () => {
    const { addTask } = useTasks(1, 'priority')
    const results: number[] = []

    const task1 = () =>
      new Promise((resolve) =>
        setTimeout(() => {
          results.push(1)
          resolve(1)
        }, 10)
      )
    const task2 = () =>
      new Promise((resolve) =>
        setTimeout(() => {
          results.push(2)
          resolve(2)
        }, 5)
      )
    const task3 = () =>
      new Promise((resolve) =>
        setTimeout(() => {
          results.push(3)
          resolve(3)
        }, 5)
      )

    const p1 = addTask(task1, 0)
    // task1 takes the only slot immediately because of microtask delay if we await or if they are in the same synchronous block?
    // In useTasks, runTask is queued in a microtask.
    // So all synchronous addTasks will be queued before runTask runs.
    const p2 = addTask(task2, 1)
    const p3 = addTask(task3, 2)

    await Promise.all([p1, p2, p3])

    // task3 has higher priority than task2, so it should run before task2.
    // Wait, the first task will be picked based on max priority among all 3!
    // So order should be 3, 2, 1
    expect(results).toEqual([3, 2, 1])
  })

  it('should limit concurrency', async () => {
    const { addTask, runningCount } = useTasks(2)

    let maxRunning = 0
    const createTask = () =>
      new Promise((resolve) => {
        maxRunning = Math.max(maxRunning, runningCount.value)
        setTimeout(resolve, 10)
      })

    const promises = [addTask(createTask), addTask(createTask), addTask(createTask)]
    await Promise.all(promises)

    // maxRunning should be 2 because concurrency is 2
    expect(maxRunning).toBe(2)
  })

  it('should handle task rejection properly', async () => {
    const { addTask } = useTasks(1)
    const task = () => Promise.reject(new Error('task error'))

    await expect(addTask(task)).rejects.toThrow('task error')
  })
})

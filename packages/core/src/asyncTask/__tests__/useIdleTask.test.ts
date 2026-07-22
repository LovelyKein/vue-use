import { afterEach, describe, expect, it, vi } from 'vitest'

import { useIdleTask } from '../useIdleTask'

describe('useIdleTask', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    delete (globalThis as any).requestIdleCallback
  })

  it('should resolve with task result when timeRemaining is sufficient', async () => {
    const requestIdleCallbackMock = vi.fn((callback: any) => {
      callback({ timeRemaining: () => 10 })
      return 1
    })

    ;(globalThis as any).requestIdleCallback = requestIdleCallbackMock

    const task = vi.fn(() => 42)

    await expect(useIdleTask(task)).resolves.toBe(42)
    expect(task).toHaveBeenCalledTimes(1)
    expect(requestIdleCallbackMock).toHaveBeenCalledTimes(1)
  })

  it('should retry until timeRemaining is sufficient', async () => {
    const timeRemainingValues = [0, 10]
    const requestIdleCallbackMock = vi.fn((callback: any) => {
      const timeRemaining = timeRemainingValues.shift() ?? 0
      callback({ timeRemaining: () => timeRemaining })
      return 1
    })

    ;(globalThis as any).requestIdleCallback = requestIdleCallbackMock

    const task = vi.fn(() => 'done')

    await expect(useIdleTask(task)).resolves.toBe('done')
    expect(task).toHaveBeenCalledTimes(1)
    expect(requestIdleCallbackMock).toHaveBeenCalledTimes(2)
  })

  it('should reject when task throws', async () => {
    ;(globalThis as any).requestIdleCallback = vi.fn((callback: any) => {
      callback({ timeRemaining: () => 10 })
      return 1
    })

    const task = () => {
      throw new Error('task error')
    }

    await expect(useIdleTask(task)).rejects.toThrow('task error')
  })

  it('should reject when task is not a function', async () => {
    ;(globalThis as any).requestIdleCallback = vi.fn((callback: any) => {
      callback({ timeRemaining: () => 10 })
      return 1
    })

    await expect(useIdleTask(1 as any)).rejects.toThrow('task must be a function')
  })
})

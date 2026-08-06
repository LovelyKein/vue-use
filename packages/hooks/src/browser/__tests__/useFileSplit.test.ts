import { afterEach, describe, expect, it, vi } from 'vitest'

import { useFileSplit } from '../useFileSplit'

describe('useFileSplit', () => {
  const originalWorker = globalThis.Worker
  const originalHardwareConcurrency = navigator.hardwareConcurrency

  afterEach(() => {
    globalThis.Worker = originalWorker
    Object.defineProperty(navigator, 'hardwareConcurrency', {
      value: originalHardwareConcurrency,
      configurable: true
    })
    vi.restoreAllMocks()
  })

  it('should reject when chunkSize <= 0', async () => {
    const file = new File([new Uint8Array([1, 2, 3])], 'test.bin')
    await expect(useFileSplit(file, 0)).rejects.toThrow('chunkSize 必须大于 0')
  })

  it('should use reduced workerCount and merge chunks', async () => {
    Object.defineProperty(navigator, 'hardwareConcurrency', {
      value: 12,
      configurable: true
    })

    const createdWorkers: WorkerMock[] = []

    class WorkerMock {
      onmessage: ((event: MessageEvent) => void) | null = null
      onerror: ((event: Event) => void) | null = null
      onmessageerror: ((event: MessageEvent) => void) | null = null
      terminated = false
      postMessages: unknown[] = []

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      constructor(_url: unknown, _options?: unknown) {
        createdWorkers.push(this)
      }

      postMessage(message: unknown) {
        this.postMessages.push(message)
        const { blobs } = message as { blobs: Array<{ index: number }> }
        queueMicrotask(() => {
          if (this.terminated) return
          this.onmessage?.({
            data: {
              chunks: blobs.map((b) => ({ ...b, hash: `h${b.index}` }))
            }
          } as unknown as MessageEvent)
        })
      }

      terminate() {
        this.terminated = true
      }
    }

    globalThis.Worker = WorkerMock as unknown as typeof Worker

    const bytes = new Uint8Array(9 * 1024 * 1024)
    const file = new File([bytes], 'test.bin')

    const res = await useFileSplit(file, 1)

    expect(createdWorkers.length).toBe(5)
    expect(res.chunks.length).toBe(9)
    expect(res.chunks.map((c) => c.index)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8])
    expect(res.chunks[0].hash).toBe('h0')
    expect(res.chunks[8].hash).toBe('h8')
    expect(createdWorkers.every((w) => w.postMessages.length === 1)).toBe(true)
  })
})

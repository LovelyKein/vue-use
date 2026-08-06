export interface BlobInfo {
  start: number
  end: number
  blob: Blob
  index: number
}

export interface ChunkInfo extends BlobInfo {
  hash: string
}

export interface FileSplitResult {
  chunks: ChunkInfo[]
}

/**
 * 文件分块
 * @param file 文件
 * @param chunkSize 分块大小，单位：MB
 * @returns 分块结果
 */
export function useFileSplit(file: File, chunkSize: number = 2): Promise<FileSplitResult> {
  return new Promise((resolve, reject) => {
    const filename = file.name // 文件名
    const fileExt = filename.split('.').pop()?.toLowerCase() // 文件扩展名
    if (!fileExt) {
      reject(new Error('文件扩展名不能为空'))
      return
    }
    if (chunkSize <= 0) {
      reject(new Error('chunkSize 必须大于 0'))
      return
    }

    // 核心数，作为 worker 线程数量
    const cpuCount = Math.floor(navigator.hardwareConcurrency / 2) || 4
    // 分块 Blob 数组
    const chunkBlobs: BlobInfo[] = splitFile(file, chunkSize)
    if (chunkBlobs.length === 0) {
      resolve({ chunks: [] })
      return
    }

    // 线程数量，根据核心数和分块数量确定
    let workerCount = Math.min(cpuCount, chunkBlobs.length)
    // 每个线程处理的分块数量
    const chunksPerWorker = Math.ceil(chunkBlobs.length / workerCount)
    workerCount = Math.ceil(chunkBlobs.length / chunksPerWorker)

    const result: Array<ChunkInfo[]> = Array.from({ length: workerCount }, () => [])
    const workers: Array<Worker | null> = Array.from({ length: workerCount }, () => null)
    let finishCount = 0
    let settled = false

    // 终止所有 worker 线程
    const terminateAllWorkers = () => {
      for (let i = 0; i < workers.length; i++) {
        const w = workers[i]
        if (w) {
          w.terminate()
          workers[i] = null
        }
      }
    }

    // 循环创建 worker 线程
    for (let i = 0; i < workerCount; i++) {
      const start = i * chunksPerWorker
      const end = Math.min(start + chunksPerWorker, chunkBlobs.length)

      const worker = new Worker(new URL('./workers/chunkWorker.js', import.meta.url), { type: 'module' })
      workers[i] = worker

      // 处理 worker 线程产生错误
      const handleWorkerError = (error: unknown) => {
        if (settled) return
        settled = true
        terminateAllWorkers()
        reject(error instanceof Error ? error : new Error(String(error)))
      }

      worker.onerror = () => handleWorkerError(new Error('worker 执行失败'))
      worker.onmessageerror = () => handleWorkerError(new Error('worker 消息解析失败'))

      worker.onmessage = (event) => {
        const data = event.data as { chunks?: ChunkInfo[]; error?: string }
        if (data?.error) {
          handleWorkerError(new Error(data.error))
          return
        }
        if (!data?.chunks) {
          handleWorkerError(new Error('worker 返回数据格式错误'))
          return
        }

        // 存储解析结果
        result[i] = data.chunks
        // 线程执行完成，终止销毁线程
        worker.terminate()
        workers[i] = null
        // 线程执行完成，增加完成数量
        finishCount++

        // 所有 worker 线程执行完成，合并所有分块结果
        if (finishCount === workerCount) {
          if (settled) return
          settled = true
          resolve({ chunks: result.flat() })
        }
      }

      worker.postMessage({ blobs: chunkBlobs.slice(start, end) })
    }
  })
}

/**
 * 文件分块
 * @param file 文件
 * @param size 分块大小，单位：MB
 * @returns 分块 Blob 数组
 */
function splitFile(file: File, size: number): BlobInfo[] {
  const fileSize = file.size
  // 分块大小，单位：字节
  const chunkSize = size * 1024 * 1024
  const chunkCount = Math.ceil(fileSize / chunkSize)
  const chunks: BlobInfo[] = []
  for (let i = 0; i < chunkCount; i++) {
    const start = i * chunkSize
    const end = Math.min(start + chunkSize, fileSize)
    chunks.push({ start, end, blob: file.slice(start, end), index: i })
  }
  return chunks
}

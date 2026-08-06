import SparkMD5 from 'spark-md5'

import type { BlobInfo } from '../browser/useFileSplit'

self.onmessage = async (event) => {
  try {
    const { blobs } = event.data as { blobs: BlobInfo[] }
    const promises = blobs.map((blob) => {
      return new Promise((resolve, reject) => {
        // 读取文件内容
        const reader = new FileReader()
        reader.readAsArrayBuffer(blob.blob)
        reader.onload = () => {
          const md5 = new SparkMD5.ArrayBuffer()
          const arrayBuffer = reader.result as unknown as ArrayBuffer
          md5.append(arrayBuffer)
          const chunkHash = md5.end()
          resolve({ ...blob, hash: chunkHash })
        }
        reader.onerror = () => {
          reject(new Error('文件 chunk 读取失败'))
        }
      })
    })
    const chunks = await Promise.all(promises)
    self.postMessage({ chunks })
  } catch (error) {
    self.postMessage({ error: error instanceof Error ? error.message : String(error) })
  } finally {
    self.close()
  }
}

# `useFileSplit`

将大文件按指定大小分片，并在浏览器端通过多个 Web Worker 并行计算每个分片的 MD5 哈希。

## 基本用法

```ts
import { useFileSplit } from '@kyle-vueuse/hooks'

async function handleFile(file: File) {
  const { chunks } = await useFileSplit(file, 2)

  console.log('chunk count:', chunks.length)
  console.log('first chunk hash:', chunks[0]?.hash)
}
```

## 在线演示

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useFileSplit } from '@kyle-vueuse/hooks'

const chunkSize = ref(2)
const chunkCount = ref<number | null>(null)
const costSeconds = ref<number | null>(null)
const isRunning = ref(false)
const errorText = ref('')

const statusText = computed(() => {
  if (isRunning.value) return '处理中...'
  if (errorText.value) return errorText.value
  if (chunkCount.value === null || costSeconds.value === null) return '请选择文件开始分片'
  return `用时 ${costSeconds.value.toFixed(2)} 秒，共切分 ${chunkCount.value} 个 chunk`
})

async function onPickFile(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  errorText.value = ''
  chunkCount.value = null
  costSeconds.value = null
  isRunning.value = true

  const start = performance.now()
  try {
    const { chunks } = await useFileSplit(file, chunkSize.value)
    chunkCount.value = chunks.length
    costSeconds.value = (performance.now() - start) / 1000
  } catch (error) {
    errorText.value = error instanceof Error ? error.message : String(error)
  } finally {
    isRunning.value = false
    input.value = ''
  }
}
</script>

<ClientOnly>
  <div :class="$style.demo">
    <div :class="$style.row">
      <label :class="$style.label">chunkSize(MB)</label>
      <input :class="$style.input" v-model.number="chunkSize" type="number" min="0.1" step="0.1" />
    </div>
    <div :class="$style.row">
      <input :class="$style.file" type="file" @change="onPickFile" :disabled="isRunning" />
    </div>
    <div :class="$style.status">{{ statusText }}</div>
  </div>
</ClientOnly>

<style module>
.demo {
  padding: 1rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.label {
  font-size: 14px;
  color: var(--vp-c-text-2);
}
.input {
  width: 120px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  padding: 6px 10px;
  background: var(--vp-c-bg);
}
.file {
  width: 100%;
}
.status {
  font-size: 14px;
  line-height: 1.6;
  padding: 10px;
  border: 1px dashed var(--vp-c-divider);
  border-radius: 8px;
}
</style>

## API

### 签名

```ts
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

export function useFileSplit(file: File, chunkSize?: number): Promise<FileSplitResult>
```

### 参数

- `file`: `File` - 需要分片的文件。
- `chunkSize`: `number` (可选) - 分片大小，单位 MB，默认 `2`。必须大于 `0`。

### 返回值

- `Promise<FileSplitResult>`
  - `chunks`: `ChunkInfo[]` - 分片信息数组。
    - `start`: `number` - 分片起始字节偏移。
    - `end`: `number` - 分片结束字节偏移。
    - `blob`: `Blob` - 通过 `File.slice()` 得到的分片 Blob。
    - `index`: `number` - 分片序号（从 `0` 开始）。
    - `hash`: `string` - 分片内容的 MD5 值。

## 注意事项

- 仅支持浏览器环境，依赖 `Web Worker` 与 `navigator.hardwareConcurrency`。
- 内部使用 `File.slice()` 产生轻量 Blob 句柄，避免整文件读入内存。

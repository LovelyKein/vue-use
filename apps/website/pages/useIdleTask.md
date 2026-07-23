# `useIdleTask`

一个**在浏览器空闲时段执行耗时任务**的 Composition API 函数。它把任务包进 `requestIdleCallback`，仅在浏览器主线程空闲时执行，剩余时间不足（< 5ms）时递归等待下一次空闲窗口，避免阻塞用户交互。

## 基本用法

`useIdleTask` 接收一个**同步函数**作为任务，返回 `Promise`，任务的返回值会作为 Promise 的结果。

```ts
import { useIdleTask } from '@kyle-vueuse/core'

// 在主线程空闲时计算密集结果
const result = await useIdleTask(() => {
  let sum = 0
  for (let i = 0; i < 1_000_000; i++) sum += i
  return sum
})
console.log('结果:', result)
```

### 错误处理

任务抛错会通过 Promise reject 传出，**不会**被静默吞掉。

```ts
import { useIdleTask } from '@kyle-vueuse/core'

try {
  await useIdleTask(() => {
    throw new Error('oops')
  })
} catch (err) {
  console.error('任务失败:', err)
}
```

### 在线演示

<script setup lang="ts">
import { ref } from 'vue'
import { useIdleTask } from '@kyle-vueuse/core'

const logs = ref<string[]>([])
const isRunning = ref(false)

const append = (text: string) => {
  const t = new Date().toLocaleTimeString()
  logs.value.unshift(`[${t}] ${text}`)
}

const runSuccess = async () => {
  if (isRunning.value) return
  isRunning.value = true
  append('开始：成功任务（空转 50ms）')
  try {
    const result = await useIdleTask(() => {
      // 模拟一个同步耗时计算
      const end = Date.now() + 50
      while (Date.now() < end) { /* busy wait */ }
      return '完成'
    })
    append(`resolve: ${result}`)
  } catch (err) {
    append(`reject: ${(err as Error).message}`)
  } finally {
    isRunning.value = false
  }
}

const runFail = async () => {
  if (isRunning.value) return
  isRunning.value = true
  append('开始：会抛错的任务')
  try {
    await useIdleTask(() => {
      throw new Error('业务异常')
    })
    append('resolve（不应该走到这里）')
  } catch (err) {
    append(`reject: ${(err as Error).message}`)
  } finally {
    isRunning.value = false
  }
}
</script>

<ClientOnly>
  <div :class="$style.demo">
    <div :class="$style.row">
      <button :class="$style.button" :disabled="isRunning" @click="runSuccess">执行成功任务</button>
      <button :class="$style.buttonAlt" :disabled="isRunning" @click="runFail">执行失败任务</button>
      <span :class="$style.hint">{{ isRunning ? '等待浏览器空闲…' : '空闲时自动执行' }}</span>
    </div>
    <ul :class="$style.log">
      <li v-for="log in logs" :key="log">{{ log }}</li>
    </ul>
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
  flex-wrap: wrap;
}
.button {
  color: #fff;
  background-color: var(--vp-c-brand);
  padding: 6px 14px;
  border-radius: 6px;
  line-height: 1;
  border: none;
  cursor: pointer;
  font-size: 14px;
}
.button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.button:hover:not(:disabled) {
  opacity: 0.8;
}
.buttonAlt {
  color: #fff;
  background-color: #d44;
  padding: 6px 14px;
  border-radius: 6px;
  line-height: 1;
  border: none;
  cursor: pointer;
  font-size: 14px;
}
.buttonAlt:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.buttonAlt:hover:not(:disabled) {
  opacity: 0.8;
}
.hint {
  color: var(--vp-c-text-2);
  font-size: 13px;
}
.log {
  margin: 0;
  padding-left: 1.2rem;
  color: var(--vp-c-text-2);
  font-size: 0.9em;
  max-height: 220px;
  overflow-y: auto;
}
</style>

## 特性

- **不阻塞主线程**：基于浏览器的 [Cooperative Scheduling of Background Tasks](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestIdleCallback) API，在主线程空闲时执行任务。
- **自动等待空闲窗口**：当前帧剩余空闲时间不足 `5ms` 时，会递归等待下一次空闲回调，不抢占用户交互。
- **超时保护**：`requestIdleCallback` 传入 `{ timeout: 2000 }`，即使浏览器一直忙碌，最多等 `2s` 也会强制执行。
- **错误透传**：任务抛错会被 Promise reject 抛出，可被 `try/catch` 捕获。
- **零配置**：单一函数签名，无需关注并发、队列等概念（需要这些能力请用 [`useTasks`](./useTasks)）。

## API

### 签名

```ts
export function useIdleTask<T = unknown>(task: () => T): Promise<T>
```

### 参数

- `task`: `() => T` - 一个**同步函数**。函数体内执行的工作应当是 CPU 密集型计算、JSON 序列化、模板渲染等不需要异步等待的操作。返回值 `T` 会作为 Promise 的 resolve 值。

### 返回值

- `Promise<T>` - 任务在浏览器空闲时段执行完成后的结果。
  - resolve: 任务正常返回的值。
  - reject: 任务执行过程中抛出的错误；或 `task` 不是函数时直接 reject `Error('task must be a function')`。

## 注意事项

### 仅限浏览器环境

依赖 `window.requestIdleCallback`，**Node / SSR 环境下调用会抛 `ReferenceError`**。如果代码可能在 SSR 路径执行，请做环境判断：

```ts
if (typeof window === 'undefined') return
useIdleTask(() => doWork())
```

### 适合 vs 不适合

| 场景                                       | 推荐 API                                                  |
| ------------------------------------------ | --------------------------------------------------------- |
| 大数据量计算、复杂 JSON 序列化、长列表渲染 | ✅ `useIdleTask`                                          |
| 网络请求（fetch / XHR）                    | ❌ 直接用 `fetch` 即可，浏览器本身已做并发与优先级        |
| 多个任务的并发 / 调度 / 优先级             | ❌ 用 [`useTasks`](./useTasks)                            |
| 用户输入的频繁响应（搜索、输入联想）       | ❌ 用 [`debounce`](./debounce) / [`throttle`](./throttle) |

### 任务必须是同步的

`task` 应是同步函数。如果内部用 `async` / `await`，则执行时机已经被 `Promise` 微任务队列接管，**`requestIdleCallback` 包裹将失去意义**——任务会在 `await` 处立即让出，而非真正等到浏览器空闲。

# `useTasks`

一个**并发任务调度器**的 Composition API 函数。它会维护一个内部任务队列，并通过 `concurrency` 参数控制同时执行的最大并发数。支持「顺序执行」和「优先级执行」两种调度模式。

## 基本用法

### 顺序模式 (`mode: 'order'`)

默认模式，任务按 `addTask` 的调用顺序依次取出执行。

```vue
<script setup lang="ts">
import { useTasks } from '@kyle-vueuse/core'

const { addTask, remainCount, runningCount } = useTasks(3, 'order')

const fakeRequest = (time: number, label: string) => () =>
  new Promise((resolve) => setTimeout(() => resolve(label), time))

const start = () => {
  const list = [1000, 800, 600, 400, 200]
  list.forEach((t, i) => {
    addTask(fakeRequest(t, `任务${i + 1}`))
  })
}
</script>

<template>
  <div>
    <button @click="start">开始执行 5 个任务（最大并发 3）</button>
    <p>剩余任务: {{ remainCount }}</p>
    <p>正在执行: {{ runningCount }}</p>
  </div>
</template>
```

### 优先级模式 (`mode: 'priority'`)

每次取任务时，**从队列中挑出优先级最高（数字最大）的任务**执行。同一同步块内的多次 `addTask` 会在下一个微任务统一挑选，确保后入队的高优先级任务也能抢占执行槽位。同优先级按入队顺序执行。

```ts
const { addTask } = useTasks(2, 'priority')

addTask(fakeRequest(800, '低优'), 1)
addTask(fakeRequest(400, '高优'), 10)
addTask(fakeRequest(600, '中优'), 5)
// 执行顺序：高优 → 中优 → 低优
```

### 在线演示

<script setup lang="ts">
import { ref } from 'vue'
import { useTasks } from '@kyle-vueuse/core'

// 顺序模式 + 并发 3
const orderHook = useTasks(3, 'order')
const orderLogs = ref<string[]>([])

const runOrder = () => {
  orderLogs.value = []
  const items = [
    { time: 1200, label: 'A' },
    { time: 800, label: 'B' },
    { time: 600, label: 'C' },
    { time: 400, label: 'D' },
    { time: 200, label: 'E' }
  ]
  items.forEach(({ time, label }) => {
    orderHook.addTask(() =>
      new Promise<void>((resolve) =>
        setTimeout(() => {
          orderLogs.value.push(`✅ 顺序模式完成: ${label} (${time}ms)`)
          resolve()
        }, time)
      )
    )
  })
}

// 优先级模式 + 并发 2
const prioHook = useTasks(2, 'priority')
const prioLogs = ref<string[]>([])

const runPriority = () => {
  prioLogs.value = []
  const items = [
    { time: 800, label: '低优', p: 1 },
    { time: 400, label: '高优', p: 7 },
    { time: 600, label: '中优', p: 5 },
    { time: 600, label: '低优', p: 2 },
    { time: 400, label: '高优', p: 10 },
  ]
  items.forEach(({ time, label, p }) => {
    prioHook.addTask(
      () =>
        new Promise<void>((resolve) =>
          setTimeout(() => {
            prioLogs.value.push(`✅ 优先级模式完成: ${label} (p=${p}, ${time}ms)`)
            resolve()
          }, time)
        ),
      p
    )
  })
}
</script>

<div :class="$style.demo">
  <div :class="$style.section">
    <div :class="$style.title">顺序模式 (mode: 'order', concurrency: 3)</div>
    <div :class="$style.row">
      <button :class="$style.button" @click="runOrder">执行任务</button>
      <span>剩余: {{ orderHook.remainCount }} | 运行中: {{ orderHook.runningCount }}</span>
    </div>
    <ul :class="$style.log">
      <li v-for="log in orderLogs" :key="log">{{ log }}</li>
    </ul>
  </div>

  <div :class="$style.section">
    <div :class="$style.title">优先级模式 (mode: 'priority', concurrency: 2)</div>
    <div :class="$style.row">
      <button :class="$style.button" @click="runPriority">执行任务</button>
      <span>剩余: {{ prioHook.remainCount }} | 运行中: {{ prioHook.runningCount }}</span>
    </div>
    <ul :class="$style.log">
      <li v-for="log in prioLogs" :key="log">{{ log }}</li>
    </ul>
  </div>
</div>

<style module>
.demo {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.section {
  padding: 1rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
}
.title {
  font-weight: bold;
  margin-bottom: 0.8rem;
}
.row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 0.8rem;
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
.button:hover {
  opacity: 0.8;
}
.log {
  margin: 0;
  padding-left: 1.2rem;
  color: var(--vp-c-text-2);
  font-size: 0.9em;
  min-height: 1em;
}
</style>

## 特性

- 🚦 **并发控制**：通过 `concurrency` 限制同时执行的最大任务数。
- 🧭 **双调度模式**：支持「顺序执行」和「按优先级抢占执行」。
- 📊 **实时计数**：对外暴露 `remainCount`（队列里还剩几个）和 `runningCount`（正在跑几个），可直接用于 UI 展示。
- 🛡️ **错误隔离**：单个任务抛错**不会卡住队列**，槽位会在 `finally` 中正确释放。

## API

### 参数

- `concurrency`: `number` (可选) - 最大并发数，默认 `6`。
- `mode`: `'order' | 'priority'` (可选) - 任务调度模式，默认 `'order'`。
  - `'order'`：按入队顺序取出。
  - `'priority'`：每次取出队列中优先级（`priority` 数值）最高的任务；同优先级按入队顺序。

### 返回值

- `addTask`: `(task: Task, priority?: number) => Promise<unknown>` - 添加一个任务到队列，返回该任务的 `Promise`。
  - `task` - 一个**返回 Promise 的函数**。如果传入的不是函数（例如一个值或 Promise），内部会自动包装成 `() => Promise.resolve(task)`。
  - `priority` - 可选的优先级权重，**仅在 `mode: 'priority'` 下生效**，默认 `0`。
- `remainCount`: `ComputedRef<number>` - 队列中还未开始执行的任务数（**只读**）。
- `runningCount`: `ComputedRef<number>` - 当前正在执行的任务数（**只读**）。

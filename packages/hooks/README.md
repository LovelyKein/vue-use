# @kyle-vueuse/hooks

> 基于 Vue 3 Composition API 的组合式工具库

`@kyle-vueuse/hooks` 是 Kyle-VueUse 工具集的核心包，提供一系列经过工程化打磨的 Composition API 工具，涵盖异步任务、文件处理、DOM 操作、状态管理、事件监听等常见场景。所有 API 均使用 TypeScript 编写，类型完备、开箱即用。

## 特性

- **类型安全**：全量 TypeScript 编写，泛型与重载覆盖常见边界场景
- **场景驱动**：每个 API 都源自真实业务需求（如 `useFileSplit` 服务于大文件上传秒传）
- **副作用可控**：浏览器相关 API 提供 SSR 兼容判断，避免 `document is not defined`
- **可观测性**：任务队列等场景提供运行中 / 剩余任务计数（`runningCount` / `remainCount`）
- **Tree-shakable**：`sideEffects: false` + 命名导出，按需引入无冗余
- **构建产物**：`esm` / `cjs` / `types` 三件齐全，配套独立的 `workers/` 子产物

## 安装

```bash
# npm
npm install @kyle-vueuse/hooks

# pnpm
pnpm add @kyle-vueuse/hooks

# yarn
yarn add @kyle-vueuse/hooks
```

> 需要 Vue 3.5+，显式依赖 `vue` 与 `vue-demi`。

## 快速开始

```ts
import { useToggle } from '@kyle-vueuse/hooks'

export default {
  setup() {
    const { current, toggle } = useToggle()

    return {
      value: current,
      toggle
    }
  }
}
```

```html
<template>
  <button @click="toggle">{{ value ? '开启' : '关闭' }}</button>
</template>
```

## API 列表

### 数据 & 状态

| API                                                                 | 说明                                                       |
| ------------------------------------------------------------------- | ---------------------------------------------------------- |
| [`useToggle`](https://kyle-vueuse.vercel.app/pages/useToggle)       | 布尔 / 双值切换，支持传入目标值强制设定                    |
| [`useCycleList`](https://kyle-vueuse.vercel.app/pages/useCycleList) | 在数组中循环切换当前值                                     |
| [`useStorage`](https://kyle-vueuse.vercel.app/pages/useStorage)     | `localStorage` / `sessionStorage` 响应式封装，支持过期时间 |

### 异步任务

| API                                                         | 说明                                                         |
| ----------------------------------------------------------- | ------------------------------------------------------------ |
| [`useTasks`](https://kyle-vueuse.vercel.app/pages/useTasks) | 任务队列，支持并发数控制与 `order` / `priority` 两种调度模式 |

### 浏览器

| API                                                                 | 说明                                                                     |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| [`useTitle`](https://kyle-vueuse.vercel.app/pages/useTitle)         | 响应式 `document.title` 绑定，支持 `backTrack` 还原与 `observe` 反向同步 |
| [`useFileSplit`](https://kyle-vueuse.vercel.app/pages/useFileSplit) | 大文件分片 + 多 Web Worker 并行计算 MD5，结果可用于秒传 / 断点续传校验   |

### DOM

| API                                                                     | 说明                                                           |
| ----------------------------------------------------------------------- | -------------------------------------------------------------- |
| [`useExtraScript`](https://kyle-vueuse.vercel.app/pages/useExtraScript) | 按需注入 `<script>`，同 URL Promise 缓存，支持等待全局变量挂载 |

### 事件

| API                                                         | 说明                            |
| ----------------------------------------------------------- | ------------------------------- |
| [`useMouse`](https://kyle-vueuse.vercel.app/pages/useMouse) | 响应式鼠标坐标，内置 200ms 节流 |

### Vue

| API                                                               | 说明                                                          |
| ----------------------------------------------------------------- | ------------------------------------------------------------- |
| [`useOpenComp`](https://kyle-vueuse.vercel.app/pages/useOpenComp) | 通过 `ref` 调用子组件方法，自动等待异步组件挂载并支持超时保护 |

### 工具函数

| API                                                         | 说明                            |
| ----------------------------------------------------------- | ------------------------------- |
| [`debounce`](https://kyle-vueuse.vercel.app/pages/debounce) | 防抖函数，支持 `immediate` 选项 |
| [`throttle`](https://kyle-vueuse.vercel.app/pages/throttle) | 节流函数（时间戳实现）          |

## 使用示例

### `useFileSplit`：大文件分片 + 并行哈希

```ts
import { useFileSplit } from '@kyle-vueuse/hooks'

async function handleFile(file: File) {
  const { chunks } = await useFileSplit(file, 2) // 2MB / chunk
  console.log('分片数:', chunks.length)
  console.log(
    '每片 MD5:',
    chunks.map((c) => c.hash)
  )
}
```

- 内部按 `navigator.hardwareConcurrency` 分配 Worker 线程
- 使用 `File.slice()` 产生轻量 Blob 句柄，避免整文件读入内存
- 任一线程出错立即 `terminate` 所有 Worker 并 reject

### `useStorage`：带过期时间的本地存储

```ts
import { useStorage } from '@kyle-vueuse/hooks'

const { value, set, remove } = useStorage('user-token', {
  initialValue: '',
  expired: 60 * 60 * 24, // 1 天后过期
  mode: 'local'
})
```

- `timestamp: 0` 表示永不过期
- 读路径自动检测过期并降级到 `initialValue`
- 解析失败清理脏数据，避免组件白屏

### `useTasks`：并发可控的异步任务队列

```ts
import { useTasks } from '@kyle-vueuse/hooks'

const { addTask, runningCount, remainCount } = useTasks(6, 'priority')

addTask(() => fetch('/api/a').then((r) => r.json()), 1)
addTask(() => fetch('/api/b').then((r) => r.json()), 10) // 优先级更高，先执行
```

## 浏览器兼容

| API              | 环境要求                                                  |
| ---------------- | --------------------------------------------------------- |
| `useFileSplit`   | 浏览器，需支持 `Worker` + `navigator.hardwareConcurrency` |
| `useStorage`     | 浏览器，需 `localStorage` / `sessionStorage`              |
| `useExtraScript` | 浏览器                                                    |
| `useTitle`       | 自动检测 `document`，SSR 安全                             |
| 其他             | 通用，无特殊环境依赖                                      |

## 文档

完整 API 文档与在线演示：[kyle-vueuse.vercel.app](https://kyle-vueuse.vercel.app/)

## 工程化

- **构建**：Rollup + `@rollup/plugin-typescript`，ESM / CJS 双产物
- **类型**：`declaration: true` + `declarationMap`，IDE 跳转可直达源码
- **测试**：Vitest（见 `src/**/__tests__/`）
- **文档**：VitePress（`apps/website`）
- **Monorepo**：pnpm workspace，多包协同

## License

[ISC](https://opensource.org/licenses/ISC) — 详见 `package.json` 的 `license` 字段。

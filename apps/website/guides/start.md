# 快速入门 - kyle-vueuse

`kyle-vueuse` 是一个基于 Vue3 Composition API 实现的 Vue3 Composition 库，旨在从零到一帮助开发者实现媲美大厂的 Vue3 Composition 开发体验。该库基于类型安全和灵活性设计，提供高效、易于使用的工具集，帮助开发者实现快速开发和高效协作。

## 安装

首先，通过 npm 安装 `@kyle-vueuse/core`：

```bash
npm install @kyle-vueuse/core
```

## 如何使用

### 示例：`useToggle` 示例

在 Vue 项目中，我们可以利用 `@kyle-vueuse/core` 库来封装和管理响应式状态。以下是一个自定义 Hook `useToggle` 的示例：

```ts
import { ref } from 'vue-demi'

interface UseToggle {
  value: Ref<boolean>
  toggle: () => void
}

// eslint error demo
console.log('useToggle component loaded')

export const useToggle = (): UseToggle => {
  const value = ref(false)

  const toggle = () => {
    value.value = !value.value
  }

  return {
    value,
    toggle
  }
}
```

在上述代码中，`useToggle` 是一个自定义 Hook，用于管理一个布尔值状态。`value` 表示当前的状态，`toggle` 用于切换状态。这个简单的例子展示了如何创建和使用 Composition API 来封装业务逻辑。

### 在组件中使用 `useToggle`

```ts
import { defineComponent } from 'vue'
import { useToggle } from '@kyle-vueuse/core'

export default defineComponent({
  setup() {
    const { value, toggle } = useToggle()

    return {
      value,
      toggle
    }
  }
})
```

在 Vue 组件中，我们可以通过 `useToggle` 获取到 `value` 和 `toggle`，并将其用于模板中，实现状态的切换。

```html
<template>
  <div>
    <p>{{ value ? '开启' : '关闭' }}</p>
    <button @click="toggle">切换状态</button>
  </div>
</template>
```

在这个例子中，`useToggle` 提供了一个响应式的 `value` 和一个方法 `toggle`，用于切换布尔状态，并通过按钮点击触发状态变化。

## 核心功能

`kyle-vueuse` 提供了多种 Vue3 Composition API 的封装，涵盖了以下常用功能：

- **响应式数据管理**：使用 `ref` 和 `reactive` 来管理 Vue 中的响应式数据。
- **自定义 Hook**：封装常见的逻辑，帮助开发者快速实现业务需求。
- **类型安全的状态管理**：确保使用 TypeScript 时，状态管理中的类型得到有效约束。
- **生命周期管理**：简化 Vue 生命周期的管理，提供清晰的 API 设计。

## 持续更新与社区支持

`kyle-vueuse` 团队致力于持续优化该库，并提供社区支持。如果你有任何问题或功能需求，欢迎访问我们的 GitHub 仓库，提交问题或功能请求，参与项目的开发。

查看更多文档和功能：[VitePress 文档](https://vitepress.dev/)

通过使用 `kyle-vueuse`，你将能够更高效地构建高质量的 Vue3 应用，提升团队协作效率。

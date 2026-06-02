# `useTitle`

一个用于获取和设置页面标题 (`document.title`) 的响应式 Composition API 函数。支持监听外部修改和组件卸载时恢复原标题。

## 基本用法

获取和修改页面的 `title`。

```vue
<script setup lang="ts">
import { useTitle } from '@kyle-vueuse/core'

const title = useTitle()
</script>

<template>
  <div>
    <input v-model="title" type="text" />
  </div>
</template>
```

### 在线演示

<script setup lang="ts">
import { useTitle } from '@kyle-vueuse/core'

const title = useTitle(null, { backTrack: true })
</script>

<div :class="$style.demo">
  <div :class="$style.text">当前页面标题: {{ title }}</div>
  <div :class="$style.row">
    <input :class="$style.input" v-model="title" type="text" placeholder="修改标题..." />
  </div>
  <div :class="$style.tip">注: 组件卸载时会自动恢复原标题 (backTrack: true)</div>
</div>

<style module>
.demo {
  padding: 1rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}
.text {
  font-weight: bold;
}
.row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.input {
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  padding: 6px 12px;
  background: var(--vp-c-bg);
  width: 100%;
  max-width: 300px;
}
.tip {
  font-size: 0.9em;
  color: var(--vp-c-text-2);
}
</style>

## API

### 参数

- `initialTitle`: `string | Ref<string | null | undefined> | null` (可选) - 初始标题。如果为空，则默认获取当前的 `document.title`。
- `options`: `UseTitleOptions` (可选)
  - `backTrack`: `boolean` - 当组件卸载时是否恢复为之前的标题。默认为 `false`。
  - `observe`: `boolean` - 是否使用 `MutationObserver` 监听外部对 `document.title` 的修改并同步到 ref 中。默认为 `false`。

### 返回值

- `title`: `Ref<string>` - 响应式的标题变量，修改该值会自动更新 `document.title`。

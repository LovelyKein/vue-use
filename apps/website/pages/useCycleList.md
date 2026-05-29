# `useCycleList`

一个用于在列表项中循环切换的 Composition API 函数。

## 基本用法

传入一个数组，可以依次切换数组中的元素。如果到了最后一个，再切换就会回到第一个。

```vue
<script setup lang="ts">
import { useCycleList } from '@kyle-vueuse/core'

const { current, toggle } = useCycleList(['dog', 'cat', 'bird'], 'cat')
</script>

<template>
  <div>
    <div>当前: {{ current }}</div>
    <button @click="toggle()">切换</button>
  </div>
</template>
```

### 在线演示

<script setup lang="ts">
import { useCycleList } from '@kyle-vueuse/core'

const { current, toggle } = useCycleList(['🐶 dog', '🐱 cat', '🐦 bird'], '🐱 cat')
</script>

<div :class="$style.demo">
  <div :class="$style.text">当前: {{ current }}</div>
  <button :class="$style.button" @click="toggle()">切换下一个</button>
</div>

<style module>
.demo {
  padding: 1rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-start;
}
.text {
  font-weight: bold;
}
.button {
  color: #fff;
  background-color: var(--vp-c-brand);
  padding: 8px 14px;
  border-radius: 6px;
  line-height: 1;
  border: none;
  cursor: pointer;
}
.button:hover {
  opacity: 0.8;
}
</style>

## API

### 参数

- `options`: `T[]` - 必须提供的数组，表示需要循环切换的元素。不能为空数组。
- `initialValue`: `T` (可选) - 初始值，如果该值不在数组中，默认取数组的第一项。

### 返回值

- `current`: `Ref<T>` - 当前选中的值。
- `toggle`: `() => void` - 切换到下一个元素的函数，到达末尾时会回到开头。

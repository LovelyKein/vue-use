# `useToggle`

一个用于在两个状态值之间切换的 Composition API 函数。支持布尔值切换或自定义值切换。

## 基本用法

### 布尔值切换

默认情况下，`useToggle` 会在 `true` 和 `false` 之间切换。

```vue
<script setup lang="ts">
import { useToggle } from '@kyle-vueuse/hooks'

const { current, toggle } = useToggle()
</script>

<template>
  <div>
    <div>当前状态: {{ current }}</div>
    <button @click="toggle()">切换状态</button>
    <button @click="toggle(true)">强制开启</button>
  </div>
</template>
```

### 自定义值切换

可以传入自定义的 `truthyValue` 和 `falsyValue` 来实现特定字符串或数字的切换。

```vue
<script setup lang="ts">
import { useToggle } from '@kyle-vueuse/hooks'

const { current, toggle } = useToggle('On', 'Off')
</script>

<template>
  <div>
    <div>当前状态: {{ current }}</div>
    <button @click="toggle()">切换状态</button>
  </div>
</template>
```

### 在线演示

<script setup lang="ts">
import { useToggle } from '@kyle-vueuse/hooks'
const { current: boolState, toggle: toggleBool } = useToggle()
const { current: customState, toggle: toggleCustom } = useToggle('On', 'Off')
</script>

<div :class="$style.demo">
  <div :class="$style.row">
    <span>布尔值切换: {{ boolState }}</span>
    <button :class="$style.button" @click="toggleBool()">切换</button>
    <button :class="$style.button" @click="toggleBool(true)">强制为 true</button>
  </div>
  <div :class="$style.row">
    <span>自定义切换: {{ customState }}</span>
    <button :class="$style.button" @click="toggleCustom()">切换</button>
  </div>
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
.row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.button {
  color: #fff;
  background-color: var(--vp-c-brand);
  padding: 6px 12px;
  border-radius: 6px;
  line-height: 1;
  border: none;
  cursor: pointer;
  font-size: 14px;
}
.button:hover {
  opacity: 0.8;
}
</style>

## API

### 签名

```ts
export function useToggle(): UseToggleReturn<boolean>
export function useToggle<T>(truthyValue: T, falsyValue: T, initialValue?: T): UseToggleReturn<T>
```

### 参数

- `truthyValue`: `T` (可选) - 视为真的值，默认为 `true`。
- `falsyValue`: `T` (可选) - 视为假的值，默认为 `false`。
- `initialValue`: `T` (可选) - 初始值，默认取 `falsyValue`。

### 返回值

- `current`: `Ref<T>` - 当前的值。
- `toggle`: `(overrideValue?: T) => void` - 切换函数。如果传入了与两个预设值匹配的参数，则强制切换为该值，否则在两者间切换。

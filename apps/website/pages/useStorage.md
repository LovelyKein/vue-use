# `useStorage`

一个响应式的本地存储 (LocalStorage/SessionStorage) API。提供自动序列化、反序列化、过期时间管理以及多端同步功能。

## 基本用法

通过传入一个 `key` 和配置对象，可以将数据持久化存储。

```vue
<script setup lang="ts">
import { useStorage } from '@kyle-vueuse/core'

const { value, set, remove } = useStorage('vueuse-storage-demo', {
  initialValue: 'Hello VueUse',
  mode: 'local' // 默认值，也可以填 session
})
</script>

<template>
  <div>
    <div>当前值: {{ value }}</div>
    <input v-model="value" type="text" />
    <button @click="set('New Value')">设置为 New Value</button>
    <button @click="remove">移除缓存</button>
  </div>
</template>
```

### 在线演示

<script setup lang="ts">
import { useStorage } from '@kyle-vueuse/core'
import type { Ref } from 'vue'
import { ref } from 'vue'

type StorageDemo = {
  value: Ref<string>
  set: (val: string, newExpired?: number) => void
  remove: () => void
}

const initialValue = 'Hello VueUse'
const fallbackValue = ref(initialValue)
const fallbackSet = (val: string) => {
  fallbackValue.value = val
}
const fallbackRemove = () => {
  fallbackValue.value = initialValue
}

const demo: StorageDemo =
  typeof window === 'undefined'
    ? { value: fallbackValue, set: fallbackSet, remove: fallbackRemove }
    : useStorage<string>('vueuse-storage-demo', { initialValue })

const { value, set, remove } = demo
</script>

<div :class="$style.demo">
  <div :class="$style.text">当前值: {{ value }}</div>
  <div :class="$style.row">
    <input :class="$style.input" v-model="value" type="text" />
  </div>
  <div :class="$style.row">
    <button :class="$style.button" @click="set('New Value')">设置为 New Value</button>
    <button :class="$style.buttonDanger" @click="remove">移除缓存 (恢复初始值)</button>
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
.buttonDanger {
  color: #fff;
  background-color: #e53e3e;
  padding: 8px 14px;
  border-radius: 6px;
  line-height: 1;
  border: none;
  cursor: pointer;
}
.buttonDanger:hover {
  opacity: 0.8;
}
</style>

## 特性

- 📦 **自动序列化**：内部使用 `JSON.stringify` / `JSON.parse`，支持复杂对象。
- ⏳ **过期时间**：通过 `expired` 参数设置过期秒数，读取时自动清理过期数据。
- 🔄 **深度监听**：直接修改 `value` 响应式对象（如 `value.value = 'xxx'`），会自动同步到 Storage 中。

## API

### 参数

- `key`: `string` - 存储在 Storage 中的键名（内部会拼接统一前缀）。
- `options`: `UseStorageOptions<T>`
  - `initialValue`: `T` - 如果没有找到缓存数据，或者数据已过期时的初始值。
  - `expired`: `number` (可选) - 过期时间，单位秒，默认 1 天 (`60 * 60 * 24`)。0 表示不过期。
  - `mode`: `'local' | 'session'` (可选) - 存储模式，默认为 `local`。

### 返回值

- `value`: `Ref<T>` - 响应式的状态值。
- `set`: `(val: T, newExpired?: number) => void` - 更新值和重新设定过期时间的函数。
- `remove`: `() => void` - 从 Storage 中移除键，并把当前值重置为 `initialValue`。

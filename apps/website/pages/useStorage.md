# `useStorage`

一个用于存储和检索值的 Composition API 函数，例如存储和检索用户设置、缓存数据等。

## 基本用法

```vue
<script setup lang="ts">
import { useStorage } from '@kyle-vueuse/core'

const { value, set, remove } = useStorage('off')
</script>

<template>
  <div>
    <button @click="set('on')">{{ value }}</button>
    <button @click="set('off')">{{ value }}</button>
    <button @click="remove">移除</button>
  </div>
</template>
```

<script setup lang="ts">
import { useStorage } from '@kyle-vueuse/core'
const { value, set, remove } = useStorage('off')
</script>

<style module>
.button {
  display: flex;
  color: #fff;
  background-color: #18a058;
  padding: 8px 14px;
  border-radius: 6px;
  line-height: 1;
}
</style>

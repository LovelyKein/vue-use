# `useToggle`

一个用于在两个状态值之间切换的 Composition API 函数，例如在`true` 和 `false` 之间切换、在`on` 和 `off` 之间切换等。

## 基本用法

```vue
<script setup lang="ts">
import { useToggle } from '@kyle-vueuse/core'

const { value: state, toggle } = useToggle(['on', 'off'])
</script>

<template>
  <div>
    <button @click="toggle">{{ state }}</button>
  </div>
</template>
```

<script setup lang="ts">
import { useToggle } from '@kyle-vueuse/core'
const { value: state, toggle } = useToggle(['on', 'off'])
</script>

{{ state }}

<div>
  <button :class="$style.button" @click="toggle">切换</button>
</div>

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

# `useMouse`

一个用于获取鼠标当前位置的 Composition API 函数。为了提升性能，内部使用了 `throttle`（200ms）来节流 `mousemove` 事件。

## 基本用法

```vue
<script setup lang="ts">
import { useMouse } from '@kyle-vueuse/hooks'

const { x, y } = useMouse()
</script>

<template>
  <div>
    <div>Mouse X: {{ x }}</div>
    <div>Mouse Y: {{ y }}</div>
  </div>
</template>
```

### 在线演示

<script setup lang="ts">
import { useMouse } from '@kyle-vueuse/hooks'

const { x, y } = useMouse()
</script>

<div :class="$style.demo">
  <div :class="$style.text">将鼠标移入页面以查看坐标变化 (节流 200ms)</div>
  <div :class="$style.row">
    <strong>X:</strong> <span>{{ x }}</span>
  </div>
  <div :class="$style.row">
    <strong>Y:</strong> <span>{{ y }}</span>
  </div>
</div>

<style module>
.demo {
  padding: 1rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.text {
  color: var(--vp-c-text-2);
}
.row {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: monospace;
  font-size: 1.2rem;
}
</style>

## API

### 返回值

- `x`: `Ref<number>` - 鼠标当前的 X 轴坐标 (`clientX`)
- `y`: `Ref<number>` - 鼠标当前的 Y 轴坐标 (`clientY`)

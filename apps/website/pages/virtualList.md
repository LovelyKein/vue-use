# `VirtualList`

一个用于渲染长列表的虚拟滚动组件。通过仅渲染可视区域内的列表项，实现万级数据的流畅滚动。支持定长高度与动态高度（基于 `ResizeObserver` 实时修正）两种模式。

> 使用前需在应用入口引入样式：`import '@kyle-vueuse/components/style.css'`

## 基本用法

定长高度模式下，只需提供 `data` 与 `itemHeight`。**容器必须给定明确高度**（`VirtualList` 本身高度为 `100%`）。

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { VirtualList } from '@kyle-vueuse/components'
import '@kyle-vueuse/components/style.css'

const list = ref(Array.from({ length: 10000 }, (_, i) => ({ id: i, text: `Item ${i + 1}` })))
</script>

<template>
  <div style="height: 400px">
    <VirtualList :data="list" :item-height="50">
      <template #default="{ item }">
        <div style="height: 50px; line-height: 50px; padding: 0 12px; border-bottom: 1px solid #eee">
          {{ item.text }}
        </div>
      </template>
    </VirtualList>
  </div>
</template>
```

## 动态高度

当列表项高度不一致时，传入 `dynamic` 开启动态高度修正：组件先用 `itemHeight` 作为预估值渲染，再通过 `ResizeObserver` 监听可见节点真实尺寸并回填 `positions`，保证滚动偏移与总高度准确。

```vue
<VirtualList :data="list" :item-height="80" dynamic>
  <template #default="{ item }">
    <div>{{ item.text }}</div>
  </template>
</VirtualList>
```

### 在线演示

<script setup lang="ts">
import { ref } from 'vue'
import { VirtualList } from '@kyle-vueuse/components'
import '@kyle-vueuse/components/style.css'

const list = ref(
  Array.from({ length: 5000 }, (_, i) => ({
    id: i,
    text: `第 ${i + 1} 条数据`
  }))
)
</script>

<div :class="$style.demo">
  <div :class="$style.header">共 {{ list.length }} 条数据，仅渲染可视区域</div>
  <div :class="$style.list">
    <VirtualList :data="list" :item-height="44" :gap="0">
      <template #default="{ item }">
        <div :class="$style.item">{{ item.text }}</div>
      </template>
    </VirtualList>
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
.header {
  color: var(--vp-c-text-2);
  font-size: 14px;
}
.list {
  height: 320px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  overflow: hidden;
}
.item {
  height: 44px;
  padding: 0 16px;
  line-height: 44px;
  border-bottom: 1px solid var(--vp-c-divider);
  font-family: monospace;
}
</style>

## API

### Props

| 参数       | 说明                               | 类型                        | 默认值  |
| ---------- | ---------------------------------- | --------------------------- | ------- |
| data       | 列表数据                           | `Record<string, unknown>[]` | -       |
| itemHeight | 列表项高度（px）                   | `number`                    | `80`    |
| gap        | 列表项间距（px）                   | `number`                    | `0`     |
| dynamic    | 是否启用动态高度修正               | `boolean`                   | `false` |
| fieldKey   | 列表项唯一标识字段名               | `string`                    | `'id'`  |
| buffer     | 前后缓冲区项数，用于减少滚动时白屏 | `number`                    | `4`     |

### Slots

| 插槽名  | 说明       | 作用域参数              |
| ------- | ---------- | ----------------------- |
| default | 列表项内容 | `item` - 当前项数据对象 |

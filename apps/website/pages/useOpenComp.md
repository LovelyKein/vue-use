# `useOpenComp`

在父组件中安全调用子组件实例的方法，兼容异步组件 / `v-if` 场景下实例延迟挂载的问题。

核心行为：

- 当 `instanceRef.value` 已存在时，立即调用方法。
- 当实例尚未挂载时，监听 `instanceRef`，在实例出现后调用一次并自动停止监听。
- 默认 5 秒超时，超时会停止监听并输出 warning。

## 基本用法

```ts
import type { ComponentPublicInstance } from 'vue'
import { ref } from 'vue'
import { useOpenComp } from '@kyle-vueuse/core'

const childRef = ref<ComponentPublicInstance | null>(null)

function openChild() {
  useOpenComp(childRef, 'open', ['hello'])
}
```

## 在线演示

<script setup lang="ts">
import { computed, defineComponent, h, ref } from 'vue'
import type { ComponentPublicInstance } from 'vue'
import { useOpenComp } from '@kyle-vueuse/core'

const childRef = ref<ComponentPublicInstance | null>(null)
const isMounted = ref(false)
const logs = ref<string[]>([])

const ChildComp = defineComponent({
  name: 'ChildComp',
  setup(_, { expose }) {
    const open = (msg: unknown) => {
      logs.value = [...logs.value, `child.open(${String(msg)})`]
    }
    expose({ open })
    return () => h('div', { class: 'childBox' }, '子组件已挂载')
  },
})

const mountText = computed(() => (isMounted.value ? '卸载子组件' : '挂载子组件'))

function toggleMount() {
  isMounted.value = !isMounted.value
}

function callOpen() {
  useOpenComp(childRef, 'open', ['from parent'])
}
</script>

<div :class="$style.demo">
  <div :class="$style.row">
    <button :class="$style.button" @click="toggleMount">{{ mountText }}</button>
    <button :class="$style.button" @click="callOpen">调用子组件 open</button>
  </div>
  <div :class="$style.row">
    <component :is="ChildComp" v-if="isMounted" ref="childRef" />
  </div>
  <div :class="$style.log">
    <div v-for="(item, idx) in logs" :key="idx">{{ item }}</div>
  </div>
</div>

<style module>
.demo {
  padding: 1rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 12px;
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
.log {
  padding: 10px;
  border: 1px dashed var(--vp-c-divider);
  border-radius: 8px;
  font-size: 13px;
  line-height: 1.6;
}
</style>

## API

### 签名

```ts
import type { ComponentPublicInstance, Ref } from 'vue'

export function useOpenComp<T extends ComponentPublicInstance = ComponentPublicInstance>(
  instanceRef: Ref<T | null | undefined>,
  funcName: string,
  params?: Array<unknown>
): void
```

### 参数

- `instanceRef`: `Ref<T | null | undefined>` - 子组件实例引用（通常来自模板 `ref="xxx"`）。
- `funcName`: `string` - 需要调用的实例方法名（需子组件 `defineExpose`）。
- `params`: `unknown[]` (可选) - 调用参数列表，默认 `[]`。

# `debounce`

提供防抖功能的工具函数。在指定的延迟时间内，如果函数被多次调用，则只会执行最后一次。支持配置是否在延迟开始前立即执行。

## 基本用法

```ts
import { debounce } from '@kyle-vueuse/core'

const handleInput = debounce((val) => {
  console.log('输入内容:', val)
}, 500)

// 快速连续调用只会执行最后一次
handleInput('1')
handleInput('12')
handleInput('123') // 500ms 后输出 '123'
```

### 立即执行

如果希望在触发的瞬间立刻执行一次，后续在延迟时间内不再执行，可以配置 `immediate: true`。

```ts
const handleSearch = debounce(
  (val) => {
    console.log('搜索:', val)
  },
  500,
  { immediate: true }
)

handleSearch('Vue') // 立即输出
handleSearch('VueU') // 在 500ms 内调用，不会输出
```

## API

### 参数

- `fn`: `T extends (...args: any[]) => void` - 需要防抖的原始函数。
- `delay`: `number` - 防抖的时间间隔，单位毫秒 (ms)。必须是正数。
- `options`: `DebounceOptions` (可选)
  - `immediate`: `boolean` - 是否在延迟开始前立即执行一次。默认 `false`。

### 返回值

返回一个包裹了防抖逻辑的新函数。

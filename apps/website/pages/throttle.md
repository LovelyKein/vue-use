# `throttle`

提供节流功能的工具函数。在指定的延迟时间内，无论函数被调用多少次，都只执行一次。常用于高频事件（如 `scroll`, `mousemove`, `resize`）的性能优化。

## 基本用法

```ts
import { throttle } from '@kyle-vueuse/core'

const handleScroll = throttle(() => {
  console.log('页面滚动')
}, 200)

// 监听滚动事件，每 200ms 最多执行一次
window.addEventListener('scroll', handleScroll)
```

## API

### 参数

- `fn`: `T extends (...args: any[]) => void` - 需要节流的原始函数。
- `delay`: `number` - 节流的时间间隔，单位毫秒 (ms)。必须是大于 0 的数字。

### 返回值

返回一个包裹了节流逻辑的新函数。

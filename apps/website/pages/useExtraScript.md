# `useExtraScript`

按需插入并加载额外的 `<script>` 脚本。支持传入脚本 URL 与全局变量名（可选），并在同一会话内复用 Promise，避免重复插入同一个脚本。

## 基本用法

### 仅加载脚本

```ts
import { useExtraScript } from '@kyle-vueuse/core'

await useExtraScript('https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js')
```

### 加载并获取全局变量

```ts
import { useExtraScript } from '@kyle-vueuse/core'

const axios = (await useExtraScript('https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js', 'axios')) as any
await axios.get('https://example.com')
```

### 传入 script 属性

```ts
import { useExtraScript } from '@kyle-vueuse/core'

await useExtraScript('https://example.com/sdk.js', 'SDK', {
  async: true,
  defer: true,
  crossorigin: 'anonymous'
})
```

## API

### 签名

```ts
type ScriptAttrs = Record<string, string | boolean>

export function useExtraScript(scriptUrl: string, globalVarName?: string, attrs?: ScriptAttrs): Promise<unknown>
```

### 参数

- `scriptUrl`: `string` - 脚本地址（`<script src="...">`）。
- `globalVarName`: `string` (可选) - 期望脚本加载后挂载到 `window` 的变量名，支持多级路径，如 `A.B.C`。
- `attrs`: `Record<string, string | boolean>` (可选) - 额外的 `<script>` 属性。

### 返回值

- `Promise<unknown>`
  - 传入 `globalVarName` 时：resolve 为 `window[globalVarName]` 对应值。
  - 未传入 `globalVarName` 时：resolve 为创建或复用的 `HTMLScriptElement`。

### 异常

- 非浏览器环境会 reject：`useExtraScript 仅支持浏览器环境`
- 脚本加载失败会 reject：`Failed to load script: ${scriptUrl}`
- 传入 `globalVarName` 但脚本加载完成后未挂载对应变量会 reject

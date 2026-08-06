# Kyle-VueUse

> VueUse Composition API -- 基于 Vue 3 的 Composition API 工具集 + 组件库

Kyle-VueUse 是一个 pnpm monorepo 工程，包含组合式工具库（hooks）、UI 组件库（components）与文档站点（website）。所有 API / 组件均使用 TypeScript 编写，类型完备、开箱即用。

## 仓库结构

```
kyle-vueuse
├── apps/
│   └── website/            # VitePress 文档站点
├── packages/
│   ├── components/         # 组件库（@kyle-vueuse/components）
│   │   └── src/components/ # 组件源码（VirtualList 等）
│   └── hooks/              # 组合式工具库（@kyle-vueuse/hooks）
│       └── src/            # 按场景分目录：asyncTask / browser / data / dom / events / utils / vue / workers
├── 远程物料组件方案.md      # 远程物料加载 + Import Maps + CSS 方案文档
└── pnpm-workspace.yaml
```

## 环境要求

- **Node.js** >= 22
- **pnpm** >= 10（使用 `pnpm@10.13.1`）
- **Vue** 3.5+

## 快速开始

### 安装依赖

```bash
pnpm install
```

### 常用命令

| 命令                                         | 说明                       |
| -------------------------------------------- | -------------------------- |
| `pnpm dev:doc`                               | 启动文档站点开发服务器     |
| `pnpm build:doc`                             | 构建文档站点               |
| `pnpm dev:hooks` / `pnpm dev:components`     | 开发 hooks / components 包 |
| `pnpm build:hooks` / `pnpm build:components` | 构建 hooks / components 包 |
| `pnpm test`                                  | 运行所有包的测试           |
| `pnpm typecheck`                             | 所有包类型检查             |
| `pnpm lint`                                  | ESLint 修复                |
| `pnpm spellcheck`                            | cspell 拼写检查            |
| `pnpm commit`                                | git-cz 交互式提交          |

## 包说明

### @kyle-vueuse/hooks

组合式工具库，覆盖异步任务、文件处理、DOM 操作、状态管理、事件监听等场景。

```ts
import { useToggle } from '@kyle-vueuse/hooks'

const { current, toggle } = useToggle()
```

### @kyle-vueuse/components

Vue 3 组件库，底层依赖 `@kyle-vueuse/hooks`。提供多种打包方案（详见 [packages/components/README.md](./packages/components/README.md)）。

```vue
<script setup lang="ts">
import { VirtualList } from '@kyle-vueuse/components'
</script>

<template>
  <VirtualList :data="list" :item-height="40" />
</template>
```

## 工程化

- **Monorepo**：pnpm workspace（`packages/*` + `apps/*`）
- **构建**：Vite（components，多套配置）+ Rollup（hooks）
- **类型**：`vue-tsc` / `tsc`，输出 `.d.ts` + `.d.ts.map`
- **测试**：Vitest + happy-dom（`src/**/__tests__/`）
- **文档**：VitePress（`apps/website`）
- **代码质量**：ESLint + Prettier + commitlint + husky + lint-staged + cspell

## 文档

- 在线文档：[kyle-vueuse.vercel.app](https://kyle-vueuse.vercel.app/)
- 远程物料组件加载方案：[远程物料组件方案.md](./远程物料组件方案.md)

## License

[MIT](https://opensource.org/licenses/MIT)

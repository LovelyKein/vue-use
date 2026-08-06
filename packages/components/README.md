# @kyle-vueuse/components

> 基于 Vue 3 的 Kyle-VueUse 组件库

`@kyle-vueuse/components` 是 Kyle-VueUse 系列的组件库包，提供一组经过工程化打磨的 Vue 3 组件。底层依赖 [`@kyle-vueuse/hooks`](../hooks) 提供的 Composition API 工具，所有组件均使用 TypeScript 编写，类型完备、开箱即用。

## 特性

- **类型安全**：完整 TypeScript 编写，组件 props / emits 强类型约束
- **可按需引入**：每个组件独立 named export，tree-shakable
- **ESM + CJS 双产物**：`sideEffects: false`，按需加载无冗余
- **构建产物**：`vue-tsc` 单独 emit `.d.ts`（含 `.d.ts.map` 源码映射），`vite` 打包 ESM / CJS 产物

## 安装

```bash
# pnpm
pnpm add @kyle-vueuse/components

# yarn
yarn add @kyle-vueuse/components
```

> 依赖 [`@kyle-vueuse/hooks`](../hooks)，会作为传递依赖自动安装。
> Vue 3.5+ 必须在宿主环境提供（peerDependencies）。

## 浏览器 / 环境要求

- Vue 3.5+
- 支持现代浏览器（Chrome / Firefox / Edge / Safari 14+）

## 打包方案

组件库提供 **4 套 Vite 配置文件**，对应不同的 CSS 处理策略。通过 `pnpm build:xxx` 脚本指定使用哪套配置，互斥使用。

### 方案总览

| 配置文件                          | 脚本                             | 产物形态                               | 适用场景                       |
| --------------------------------- | -------------------------------- | -------------------------------------- | ------------------------------ |
| `vite.config.ts`（默认）          | `pnpm build`                     | `index.js` + `index.cjs` + `style.css` | 组件库标准发布（ESM + CJS）    |
| `vite.config.cssInJs.ts`          | `pnpm build:css-in-js`           | 单个 `index.js`（CSS 内联）            | 远程 ESM 物料、不管理 CSS 文件 |
| `vite.config.componentCss.ts`     | `pnpm build:component-css`       | 每组件独立 `js` + `css`                | 按需加载、Tree-shaking         |
| `vite.config.componentCssInJs.ts` | `pnpm build:component-css-in-js` | 每组件独立 `js`（CSS 内联）            | 按需加载 + 远程 ESM 物料       |

> 依赖第三方插件 `vite-plugin-css-injected-by-js`（css-in-js 相关方案使用）。

### 方案一：CSS 内联注入 JS（vite.config.cssInJs.ts）

构建时把所有组件 CSS 内联注入到入口 JS 中，运行时 JS 自动创建 `<style>` 标签插入页面，**无需单独加载 CSS 文件**。

**注意**：单入口模式下，所有组件的 CSS 会合并成一个 IIFE 注入到入口文件开头。ESM 的 Tree-shaking 能砍掉未使用的组件 JS，但**砍不掉 IIFE 里的 CSS**--import 任意一个组件都会加载全部样式。

```bash
pnpm build:css-in-js
```

产物：

```
dist/
├── index.js   # 组件逻辑 + 内联的 CSS 注入代码
└── types/
```

只产出 ES 格式：CJS 在 Node 环境无 `document`，样式注入会报错。

### 方案二：统一样式合并（vite.config.ts）

关闭 CSS 代码分割（`cssCodeSplit: false`），所有组件样式合并到单个 `style.css`，消费者一次性引入。

```bash
pnpm build:style
```

产物：

```
dist/
├── index.js      # ESM 入口
├── index.cjs     # CJS 入口
├── style.css     # 所有组件样式合并
└── types/
```

消费者使用：

```ts
import { VirtualList } from '@kyle-vueuse/components'
import '@kyle-vueuse/components/style.css'
```

### 方案三：按组件独立 CSS（vite.config.componentCss.ts）

多入口 + 开启 CSS 代码分割（`cssCodeSplit: true`），每个组件独立产出 JS + CSS，消费哪个组件就引哪个组件的样式。

```bash
pnpm build:component-css
```

产物：

```
dist/
├── index.js                      # barrel 导出
├── index.cjs
├── components/
│   ├── VirtualList.js
│   ├── VirtualList.cjs
│   └── VirtualList.css           # 单组件样式
└── types/
```

消费者使用：

```ts
import VirtualList from '@kyle-vueuse/components/components/VirtualList.js'
import '@kyle-vueuse/components/components/VirtualList.css'
```

### 方案四：按组件独立 CSS + 内联注入 JS（vite.config.componentCssInJs.ts）

多入口 + `preserveModules` 保留源文件结构 + CSS 内联注入，每个组件独立打包成单个 JS（含自己的样式），**import 哪个组件只加载哪个组件的样式**。

```bash
pnpm build:component-css-in-js
```

产物：

```
dist/
├── index.js                    # barrel 导出（无 CSS）
├── components/
│   └── VirtualList.js          # 组件逻辑 + 内联 CSS（IIFE 注入）
└── types/
```

实现要点：

- `preserveModules: true` -- 保留源文件结构，避免 Rollup 提取共享 chunk
- `cssInjectedByJsPlugin` 的 `jsAssetsFilterFunction` -- 让 CSS 只注入到 `.vue` 组件 chunk，不注入 barrel
- 只产出 ES 格式

### 使用方式

#### 方式一：scripts 脚本（推荐）

```bash
pnpm --filter @kyle-vueuse/components build:css-in-js
pnpm --filter @kyle-vueuse/components build:style
pnpm --filter @kyle-vueuse/components build:component-css
pnpm --filter @kyle-vueuse/components build:component-css-in-js
```

#### 方式二：重命名配置文件

将需要的配置文件重命名为 `vite.config.ts`，再执行 `pnpm build`。

> 更多远程物料加载方案（ESM / SystemJS / Web Components / 微前端 / JSON Schema）与 Import Maps 详解，见根目录 [远程物料组件方案.md](../../远程物料组件方案.md)。

## 工程化

- **构建**：Vite library mode + `@vitejs/plugin-vue`，ESM / CJS 双产物
- **类型**：`vue-tsc --emitDeclarationOnly` 输出 `.d.ts` + `.d.ts.map`，IDE 跳转可直达源码
- **测试**：Vitest（待补）
- **文档**：VitePress（`apps/website`）
- **Monorepo**：pnpm workspace

## License

[ISC](https://opensource.org/licenses/ISC) — 详见 `package.json` 的 `license` 字段。

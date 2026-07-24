# @kyle-vueuse/components

> 基于 Vue 3 的 Kyle-VueUse 组件库

`@kyle-vueuse/components` 是 Kyle-VueUse 系列的组件库包，提供一组经过工程化打磨的 Vue 3 组件。底层依赖 [`@kyle-vueuse/core`](../core) 提供的 Composition API 工具，所有组件均使用 TypeScript 编写，类型完备、开箱即用。

## 特性

- **类型安全**：完整 TypeScript 编写，组件 props / emits 强类型约束
- **可按需引入**：每个组件独立 named export，tree-shakable
- **支持全局注册**：内置 Vue 插件 `install` 方法，支持 `app.use()` 一次性注册
- **ESM + CJS 双产物**：`sideEffects: false`，按需加载无冗余
- **构建产物**：`vue-tsc` 单独 emit `.d.ts`（含 `.d.ts.map` 源码映射），`vite` 打包 ESM / CJS 产物

## 安装

```bash
# npm
npm install @kyle-vueuse/components

# pnpm
pnpm add @kyle-vueuse/components

# yarn
yarn add @kyle-vueuse/components
```

> 依赖 [`@kyle-vueuse/core`](../core)，会作为传递依赖自动安装。
> Vue 3.5+ 必须在宿主环境提供（peerDependencies）。

## 快速开始

### 按需引入（推荐）

```ts
import { KButton } from '@kyle-vueuse/components'
```

```vue
<template>
  <KButton type="primary" @click="onClick">主要按钮</KButton>
  <KButton type="danger" disabled>禁用</KButton>
  <KButton type="success" block>块级成功按钮</KButton>
</template>
```

### 全局注册

```ts
import { createApp } from 'vue'
import KyleVueUseComponents from '@kyle-vueuse/components'
import App from './App.vue'

const app = createApp(App)
// 不带前缀
app.use(KyleVueUseComponents)
// 或带前缀，模板中使用 <K-KButton />
app.use(KyleVueUseComponents, { prefix: 'K-' })
```

## 组件列表

| 组件      | 说明                                                                 |
| --------- | -------------------------------------------------------------------- |
| `KButton` | 基础按钮，支持 `type` / `size` / `disabled` / `block` / `nativeType` |

## API

### `<KButton>`

#### Props

| Prop         | 类型                                              | 默认值      | 说明                         |
| ------------ | ------------------------------------------------- | ----------- | ---------------------------- |
| `type`       | `'default' \| 'primary' \| 'success' \| 'danger'` | `'default'` | 按钮类型，决定主色           |
| `size`       | `'small' \| 'medium' \| 'large'`                  | `'medium'`  | 按钮尺寸                     |
| `disabled`   | `boolean`                                         | `false`     | 是否禁用                     |
| `block`      | `boolean`                                         | `false`     | 是否为块级按钮（撑满父容器） |
| `nativeType` | `'button' \| 'submit' \| 'reset'`                 | `'button'`  | 原生 `button` 的 `type` 属性 |

#### Events

| Event   | 参数                  | 说明                                    |
| ------- | --------------------- | --------------------------------------- |
| `click` | `(event: MouseEvent)` | 点击按钮时触发（disabled 状态下不触发） |

#### Slots

| Slot      | 说明     |
| --------- | -------- |
| `default` | 按钮内容 |

## 浏览器 / 环境要求

- Vue 3.5+
- 支持现代浏览器（Chrome / Firefox / Edge / Safari 14+）
- SSR 友好（组件内部不直接访问 `window` / `document`）

## 工程化

- **构建**：Vite library mode + `@vitejs/plugin-vue`，ESM / CJS 双产物
- **类型**：`vue-tsc --emitDeclarationOnly` 输出 `.d.ts` + `.d.ts.map`，IDE 跳转可直达源码
- **测试**：Vitest（待补）
- **文档**：VitePress（`apps/website`）
- **Monorepo**：pnpm workspace

## License

[ISC](https://opensource.org/licenses/ISC) — 详见 `package.json` 的 `license` 字段。

// import type { App, Component } from 'vue'

import type { VirtualListProps } from './components/VirtualList.vue'
import VirtualList from './components/VirtualList.vue'

// 命名导出：每个组件单独可按需引入
export { VirtualList }
export type { VirtualListProps }

// // 组件清单：用于全局注册
// const components: Record<string, Component> = {}

// export interface KyleVueUseComponentsOptions {
//   /**
//    * 全局注册时的组件名前缀
//    * @example prefix: 'K-' => <K-VirtualList />
//    */
//   prefix?: string
// }

// /**
//  * Vue 插件 install 方法，支持 `app.use(KyleVueUseComponents, { prefix: 'K' })` 一次性注册所有组件
//  */
// export default {
//   install(app: App, options: KyleVueUseComponentsOptions = {}) {
//     const { prefix = '' } = options
//     Object.entries(components).forEach(([name, component]) => {
//       app.component(`${prefix}${name}`, component)
//     })
//   }
// }

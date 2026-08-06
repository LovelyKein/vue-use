import { resolve } from 'node:path'

import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'

// https://vite.dev/config/
// CSS-in-JS 方案：
// - 构建时将所有组件 CSS 内联注入到 JS 产物中
// - 运行时 JS 自动创建 <style> 标签插入页面
// - 产物：单个 JS 文件，无独立 CSS 文件
// - 适用：远程 ESM 物料加载、不想单独管理 CSS 的场景
// - 注意：css-in-js 场景只产出 es 格式
//   （cjs 在 Node 环境无 document，注入会报错）

/**
 * 备用实现：手写 CSS 内联插件（保留参考，不使用）
 * 实际使用第三方插件 vite-plugin-css-injected-by-js 替代
 */
// function inlineCssPlugin(): Plugin {
//   return {
//     name: 'inline-css-into-js',
//     generateBundle(_opts, bundle) {
//       // 1. 收集所有 CSS asset 内容
//       const cssContents: string[] = []
//       for (const fileName of Object.keys(bundle)) {
//         const chunk = bundle[fileName]
//         if (chunk.type !== 'asset' || !fileName.endsWith('.css')) continue
//         const css = typeof chunk.source === 'string' ? chunk.source : ''
//         cssContents.push(css)
//         // 删除独立 CSS chunk，不再产出
//         delete bundle[fileName]
//       }
//       if (!cssContents.length) return

//       // 2. 注入到入口 JS chunk（facadeModuleId 指向入口的 chunk）
//       const allCss = cssContents.join('\n')
//       const injectCode = `;(function(){var d=document,s=d.createElement('style');s.textContent=${JSON.stringify(allCss)};d.head.appendChild(s)})();`

//       for (const fileName of Object.keys(bundle)) {
//         const chunk = bundle[fileName]
//         if (chunk.type === 'chunk' && chunk.facadeModuleId) {
//           chunk.code = injectCode + chunk.code
//         }
//       }
//     }
//   }
// }

export default defineConfig({
  plugins: [vue(), cssInjectedByJsPlugin()],
  build: {
    target: 'es2022',
    sourcemap: true,
    emptyOutDir: true,
    lib: {
      entry: resolve(import.meta.dirname, 'src/index.ts'),
      fileName: () => 'index.js',
      formats: ['es']
    },
    rollupOptions: {
      external: ['vue', /^@kyle-vueuse\//],
      output: {
        exports: 'named'
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(import.meta.dirname, 'src')
    }
  }
})

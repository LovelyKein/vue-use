import { resolve } from 'node:path'

import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'

// https://vite.dev/config/
// 按组件拆分 + CSS 内联注入 JS 方案（preserveModules）：
// - 用 preserveModules 保留源文件结构，每个组件独立输出
// - CSS 内联到各自组件的 JS 产物中（vite-plugin-css-injected-by-js）
// - jsAssetsFilterFunction 让 CSS 只注入到 .vue 组件 chunk，不注入 barrel
// - import 哪个组件就只加载哪个组件的样式
// - 产物：
//   dist/index.js                    (barrel 导出，无 CSS)
//   dist/components/VirtualList.js   (VirtualList 组件 + 内联 CSS)
// - 适用：按需加载 + 远程 ESM 物料场景
// - 注意：只产出 es 格式（cjs 在 Node 环境无 document，注入会报错）

export default defineConfig({
  plugins: [
    vue(),
    cssInjectedByJsPlugin({
      // 只注入到 .vue 组件 chunk，不注入到 barrel index.ts
      jsAssetsFilterFunction: (chunk) => chunk.facadeModuleId !== null && chunk.facadeModuleId.endsWith('.vue')
    })
  ],
  build: {
    target: 'es2022',
    sourcemap: true,
    emptyOutDir: true,
    // 开启 CSS 代码分割，每个模块独立产出 CSS
    cssCodeSplit: true,
    lib: {
      entry: resolve(import.meta.dirname, 'src/index.ts'),
      formats: ['es']
    },
    rollupOptions: {
      external: ['vue', /^@kyle-vueuse\//],
      output: {
        // 关键：保留模块结构，避免 Rollup 把共享代码提取到 shared chunk
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].js',
        assetFileNames: '[name][extname]',
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

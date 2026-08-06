import { resolve } from 'node:path'

import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// 按组件拆分样式方案（每个组件独立 JS + CSS）：
// - 每个组件单独入口，产出独立 JS + CSS
// - 消费者按需引入组件和对应样式
// - 产物：
//   dist/index.js + dist/index.cjs           (barrel 导出)
//   dist/components/VirtualList.js + .cjs    (单组件)
//   dist/components/VirtualList.css          (单组件样式)
// - 适用：按需加载、Tree-shaking 友好的组件库

export default defineConfig({
  plugins: [vue()],
  build: {
    target: 'es2022',
    sourcemap: true,
    emptyOutDir: true,
    // 开启 CSS 代码分割，每个入口独立产出 CSS
    cssCodeSplit: true,
    lib: {
      // 多入口：barrel 导出 + 每个组件单独入口
      entry: {
        index: resolve(import.meta.dirname, 'src/index.ts'),
        'components/VirtualList': resolve(import.meta.dirname, 'src/components/VirtualList.vue')
      },
      formats: ['es', 'cjs'],
      fileName: (format, entryName) => (format === 'es' ? `${entryName}.js` : `${entryName}.cjs`)
    },
    rollupOptions: {
      external: ['vue', /^@kyle-vueuse\//],
      output: {
        globals: { vue: 'Vue' },
        exports: 'named',
        // 每个入口的 CSS 跟随入口路径命名
        // 如 components/VirtualList 入口 -> components/VirtualList.css
        assetFileNames: (assetInfo) => {
          const name = assetInfo.names?.[0] ?? assetInfo.name ?? ''
          // CSS 文件保持原路径，只确保后缀
          if (name.endsWith('.css')) return name
          return `assets/${name}`
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(import.meta.dirname, 'src')
    }
  }
})

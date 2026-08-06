import { resolve } from 'node:path'

import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// 统一样式方案（所有组件 CSS 合并到单个 style.css）：
// - 所有组件的 CSS 合并打包到单个 style.css
// - 消费者一次性引入全部样式
// - 产物：index.js + index.cjs + style.css
// - 适用：组件库标准发布、消费者统一引入样式

export default defineConfig({
  plugins: [vue()],
  build: {
    target: 'es2022',
    sourcemap: true,
    emptyOutDir: true,
    // 关闭 CSS 代码分割，强制合并为一个 CSS 文件
    cssCodeSplit: false,
    lib: {
      entry: resolve(import.meta.dirname, 'src/index.ts'),
      fileName: (format) => (format === 'es' ? 'index.js' : 'index.cjs'),
      formats: ['es', 'cjs']
    },
    rollupOptions: {
      external: ['vue', /^@kyle-vueuse\//],
      output: {
        globals: { vue: 'Vue' },
        exports: 'named',
        // CSS 统一重命名为 style.css，便于消费者通过 package exports 引用
        assetFileNames: (assetInfo) => {
          const name = assetInfo.names?.[0] ?? assetInfo.name ?? ''
          if (name.endsWith('.css')) return 'style.css'
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

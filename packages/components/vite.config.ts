import { resolve } from 'node:path'

import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// 库构建模式：
// - esm + cjs 双产物
// - vue / @kyle-vueuse/core 作为 external（不打包进 bundle）
// - 入口 src/index.ts
export default defineConfig({
  plugins: [vue()],
  build: {
    target: 'es2022',
    sourcemap: true,
    emptyOutDir: true, // vite build 时清空 dist/
    // 库构建配置
    lib: {
      entry: resolve(import.meta.dirname, 'src/index.ts'),
      // 库文件名：index.js (esm) / index.cjs (cjs)
      fileName: (format) => (format === 'es' ? 'index.js' : 'index.cjs'),
      formats: ['es', 'cjs']
    },
    rollupOptions: {
      // 外部依赖：宿主环境提供，不打包进 bundle
      external: ['vue', /^@kyle-vueuse\//],
      output: {
        // 全局变量名（仅在 UMD 格式下生效；es/cjs 模式下无影响）
        globals: {
          vue: 'Vue'
        },
        // 强制 named exports：避免 default + named 混用导致
        // CJS 消费者必须用 `pkg.default.install` 才能拿到插件
        exports: 'named',
        // asset 命名
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') return 'style.css'
          return `assets/${assetInfo.name}`
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

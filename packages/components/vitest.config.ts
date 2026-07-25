import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

// 复用 vite 的 vue 插件，支持 .vue 文件的测试
// Vite 8 的 rolldown Plugin<Api> 与 vitest 的 PluginOption 类型不兼容，
// 运行时无影响，断言为 any 绕过类型检查
export default defineConfig({
  plugins: [vue() as any],
  test: {
    environment: 'happy-dom',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts', 'src/**/*.vue'],
      exclude: ['src/index.ts', 'src/**/*.test.ts', '**/__tests__/**']
    }
  }
})

import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['packages/*/src/**/*.ts', 'packages/*/src/**/*.vue'],
      exclude: ['packages/*/src/index.ts', 'packages/*/src/**/*.test.ts', '**/__tests__/**']
    }
  }
})

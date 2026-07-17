import js from '@eslint/js'
import { defineConfig } from 'eslint/config'
import prettierConfig from 'eslint-config-prettier'
import prettier from 'eslint-plugin-prettier'
import importSort from 'eslint-plugin-simple-import-sort'
import vue from 'eslint-plugin-vue'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import vueParser from 'vue-eslint-parser'

// 默认生成配置
export default defineConfig([
  {
    ignores: ['**/node_modules/**', '**/dist/**', '**/public/**', '**/.vitepress/cache/**', '**/.vitepress/dist/**']
  },
  {
    files: ['**/*.{ts,js,jsx,tsx,vue}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended, vue.configs['flat/recommended'], prettierConfig],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.vue
      },
      parser: vueParser,
      parserOptions: {
        parser: tseslint.parser,
        ecmaVersion: 'latest',
        ecmaFeatures: {
          jsx: true
        },
        extraFileExtensions: ['.vue']
      }
    },
    plugins: {
      'simple-import-sort': importSort,
      vue,
      prettier
    },
    rules: {
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'no-undef': 'warn',

      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-expressions': 'off',

      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'warn',

      'prettier/prettier': 'error',

      'vue/valid-define-emits': 'error', // 校验 defineEmits 定义是否正确
      'vue/multi-word-component-names': 'off' // 校验组件名称是否为多单词
    }
  }
])

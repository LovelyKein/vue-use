import js from '@eslint/js'
import { defineConfig } from 'eslint/config'
import importSort from 'eslint-plugin-simple-import-sort'
import pluginVue from 'eslint-plugin-vue'
import globals from 'globals'
import tseslint from 'typescript-eslint'

// 默认生成配置
export default defineConfig([
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx,vue}'],
    plugins: {
      js,
      'simple-import-sort': importSort
    },
    extends: ['js/recommended'],
    languageOptions: { globals: globals.browser },
    rules: {
      'no-console': 'error',
      'no-unused-vars': 'warn',
      'no-undef': 'warn',
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'warn'
    }
  },
  tseslint.configs.recommended,
  pluginVue.configs['flat/recommended'],
  {
    files: ['**/*.vue'],
    languageOptions: {
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
      vue: pluginVue
    },
    rules: {
      'vue/valid-define-emits': 'error', // 校验 defineEmits 定义是否正确
      'vue/multi-word-component-names': 'off' // 校验组件名称是否为多单词
    }
  }
])

// export default defineConfig([
//   {
//     languageOptions: {
//       globals: {
//         ...globals.browser,
//         computed: 'readonly',
//         defineEmits: 'readonly',
//         defineExpose: 'readonly',
//         defineProps: 'readonly',
//         onMounted: 'readonly',
//         onUnmounted: 'readonly',
//         reactive: 'readonly',
//         ref: 'readonly',
//         shallowReactive: 'readonly',
//         shallowRef: 'readonly',
//         toRef: 'readonly',
//         toRefs: 'readonly',
//         watch: 'readonly',
//         watchEffect: 'readonly'
//       }
//     },
//     name: 'xxx/vue/setup',
//     plugins: {
//       vue: pluginVue
//     }
//   },
//   pluginVue.configs['flat/recommended'],
//   {
//     files: ['**/*.{js,jsx,ts,tsx,vue}'],
//     rules: {
//       ...js.configs.recommended.rules,
//       'no-unused-vars': 'off',
//       'no-undef': 'warn',
//       'no-console': 'error',
//       'simple-import-sort/imports': 'error',
//       'simple-import-sort/exports': 'error',
//       'vue/valid-define-emits': 'error'
//     },
//     languageOptions: {
//       parserOptions: {
//         ecmaVersion: 'latest',
//         ecmaFeatures: {
//           jsx: true
//         },
//         extraFileExtensions: ['.vue'],
//         parser: tseslint.parser
//       }
//     },
//     plugins: { vue: pluginVue, 'simple-import-sort': importSort }
//   }
// ])

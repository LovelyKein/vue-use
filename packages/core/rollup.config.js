import fs from 'node:fs'
import path from 'node:path'

// 配置 rollup 处理 CommonJS 规范模块
import commonjs from '@rollup/plugin-commonjs'
// 配置 rollup 能正确解析 node_modules 下的模块路径
import resolve from '@rollup/plugin-node-resolve'
// 配置 rollup 处理 TypeScript 模块
import typescript from '@rollup/plugin-typescript'

const workerDir = 'src/workers'
const workerFiles = fs.readdirSync(workerDir).filter((fileName) => fileName.endsWith('.ts'))

const workerConfigs = workerFiles.map((fileName) => {
  const baseName = path.parse(fileName).name
  return {
    input: `${workerDir}/${fileName}`,
    output: {
      file: `dist/workers/${baseName}.js`,
      format: 'esm'
    },
    plugins: [
      resolve({
        browser: true
      }),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.worker.json'
      })
    ]
  }
})

export default [
  {
    // 输入文件路径
    input: 'src/index.ts',
    // 外部依赖，不打包进 bundle
    external: ['vue', 'vue-demi'],
    // 输出配置：导出 CommonJS 模块，支持 Node.js 环境
    output: [
      {
        file: 'dist/index.js',
        format: 'esm'
      },
      {
        file: 'dist/index.cjs',
        format: 'cjs',
        // 导出命名模块，支持 CommonJS 环境的 const { xxx } = require('xxx')
        exports: 'named'
      }
    ],
    // 插件配置：使用 TypeScript 插件
    plugins: [
      typescript({
        tsconfig: './tsconfig.json'
      })
    ]
  },
  ...workerConfigs
]

import typescript from '@rollup/plugin-typescript'

export default [
  {
    input: 'src/index.ts',
    external: ['vue', 'vue-demi'],
    output: [
      {
        file: 'dist/index.js',
        format: 'esm'
      },
      {
        file: 'dist/index.cjs',
        format: 'cjs',
        exports: 'named'
      }
    ],
    plugins: [
      typescript({
        tsconfig: './tsconfig.json'
      })
    ]
  }
]

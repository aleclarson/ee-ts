import { defineConfig } from 'tsup'

export default defineConfig({
  entry: { ee: 'src/index.ts' },
  format: ['cjs', 'esm'],
  dts: true,
})

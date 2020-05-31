import typescript from '@rollup/plugin-typescript'
import autoExternal from 'rollup-plugin-auto-external'

const externalPkgs = ['gatsby/graphql']

export default [
  {
    input: 'src/index.ts',
    output: {
      dir: './',
      entryFileNames: 'dist/index.cjs.js',
      format: 'cjs',
      sourcemap: true,
    },
    external: externalPkgs,
    plugins: [
      typescript({
        declaration: true,
        declarationDir: 'dist',
        rootDir: 'src',
      }),
      autoExternal(),
    ],
  },
  {
    input: 'src/index.ts',
    output: { file: 'dist/index.esm.js', format: 'es', sourcemap: true },
    external: externalPkgs,
    plugins: [typescript(), autoExternal()],
  },
  {
    input: 'src/gatsby-node.ts',
    output: { file: 'dist/gatsby-node.js', format: 'cjs', sourcemap: true },
    external: externalPkgs,
    plugins: [typescript(), autoExternal()],
  },
  {
    input: 'src/gatsby-browser.ts',
    output: { file: 'dist/gatsby-browser.js', format: 'cjs', sourcemap: true },
    external: externalPkgs,
    plugins: [typescript(), autoExternal()],
  },
  {
    input: 'src/gatsby-ssr.ts',
    output: { file: 'dist/gatsby-ssr.js', format: 'cjs', sourcemap: true },
    external: externalPkgs,
    plugins: [typescript()],
  },
]

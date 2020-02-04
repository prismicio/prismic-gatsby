import typescript from 'rollup-plugin-typescript2'
import json from '@rollup/plugin-json'
import pkg from './package.json'

const makeExternalPredicate = externalArr => {
  if (externalArr.length === 0) {
    return () => false
  }
  const pattern = new RegExp(`^(${externalArr.join('|')})($|/)`)
  return id => pattern.test(id)
}

const externalPkgs = makeExternalPredicate([
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {}),
])

export default [
  {
    input: 'src/index.ts',
    output: [
      { file: 'dist/index.cjs.js', format: 'cjs', sourcemap: true },
      { file: 'dist/index.esm.js', format: 'es', sourcemap: true },
    ],
    external: externalPkgs,
    plugins: [typescript()],
  },
  {
    input: 'src/gatsby-node.ts',
    output: { file: 'dist/gatsby-node.js', format: 'cjs', sourcemap: true },
    external: externalPkgs,
    plugins: [typescript(), json()],
  },
  {
    input: 'src/gatsby-browser.ts',
    output: { file: 'dist/gatsby-browser.js', format: 'cjs', sourcemap: true },
    external: externalPkgs,
    plugins: [typescript()],
  },
]

import babel from 'rollup-plugin-babel'
import json from 'rollup-plugin-json'
import { string } from 'rollup-plugin-string'
import pkg from './package.json'
import { terser } from 'rollup-plugin-terser'
import filesize from 'rollup-plugin-filesize'

const isProd = process.env.NODE_ENV === 'production'

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
  'fs',
  'path',
])

export default [
  {
    input: 'src/index.js',
    output: [
      { file: 'dist/index.cjs.js', format: 'cjs', sourcemap: true },
      { file: 'dist/index.esm.js', format: 'es', sourcemap: true },
    ],
    external: externalPkgs,
    plugins: [
      babel({ runtimeHelpers: true }),
      json(),
      isProd && terser(),
      filesize(),
    ],
  },
  {
    input: 'src/gatsby-node.js',
    output: { file: 'dist/gatsby-node.js', format: 'cjs', sourcemap: true },
    external: externalPkgs,
    plugins: [
      babel({ runtimeHelpers: true }),
      json(),
      string({ include: '**/*.graphql' }),
      filesize(),
    ],
  },
  {
    input: 'src/gatsby-browser.js',
    output: { file: 'dist/gatsby-browser.js', format: 'cjs', sourcemap: true },
    external: externalPkgs,
    plugins: [
      babel({ runtimeHelpers: true }),
      json(),
      isProd && terser(),
      filesize(),
    ],
  },
]

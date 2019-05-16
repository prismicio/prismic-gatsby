import babel from 'rollup-plugin-babel'
import { string } from 'rollup-plugin-string'
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
  'fs',
])

export default [
  {
    input: 'src/index.js',
    output: [
      { file: 'dist/index.cjs.js', format: 'cjs' },
      { file: 'dist/index.esm.js', format: 'es' },
    ],
    external: externalPkgs,
    plugins: [babel()],
  },
  {
    input: 'src/gatsby-node.js',
    output: { file: 'dist/gatsby-node.js', format: 'cjs' },
    external: externalPkgs,
    plugins: [babel(), string({ include: '**/*.graphql' })],
  },
]

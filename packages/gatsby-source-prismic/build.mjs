import * as path from 'path'
import * as url from 'url'
import * as fs from 'fs/promises'
import esbuild from 'esbuild'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
const isWatchMode = process.argv.slice(2).includes('-w')

const pkg = JSON.parse(
  await fs.readFile(path.resolve(__dirname, './package.json')),
)

await esbuild.build({
  entryPoints: [
    path.resolve(__dirname, './src/gatsby-node.ts'),
    path.resolve(__dirname, './src/index.ts'),
  ],
  outdir: path.resolve(__dirname, './dist'),
  bundle: true,
  sourcemap: true,
  platform: 'node',
  target: 'node10.23',
  watch: isWatchMode,
  external: [
    ...Object.keys(pkg.devDependencies),
    ...Object.keys(pkg.dependencies),
    ...Object.keys(pkg.peerDependencies),
  ],
})

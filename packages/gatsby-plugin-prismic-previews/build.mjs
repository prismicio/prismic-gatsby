import * as path from 'path'
import * as url from 'url'
import * as fs from 'fs/promises'
import esbuild from 'esbuild'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
const isWatchMode = process.argv.slice(2).includes('-w')

const pkg = JSON.parse(
  await fs.readFile(path.resolve(__dirname, './package.json')),
)

const common = {
  outdir: path.resolve(__dirname, './dist'),
  bundle: true,
  sourcemap: true,
  minify: process.env.NODE_ENV === 'production',
  watch: isWatchMode,
  external: [
    ...Object.keys(pkg.devDependencies),
    ...Object.keys(pkg.dependencies),
    ...Object.keys(pkg.peerDependencies),
  ],
}

// Node platform files
await esbuild.build({
  ...common,
  entryPoints: [path.resolve(__dirname, './src/gatsby-node.ts')],
  platform: 'node',
  target: 'node10.23',
})

// Browser platform files
await esbuild.build({
  ...common,
  entryPoints: [
    path.resolve(__dirname, './src/gatsby-browser.ts'),
    path.resolve(__dirname, './src/gatsby-ssr.ts'),
    path.resolve(__dirname, './src/index.ts'),
  ],
  platform: 'browser',
  format: 'esm',
  target: 'es6',
  define: {
    // We do NOT want `process.env.NODE_ENV` to be replaced with its value at
    // plugin-build time. We want to preserve the value to allow Gatsby's build
    // time to replace this.
    //
    // In the context of this plugin, `process.env.NODE_ENV` tells us if the
    // user accessing the site using Gatsby in development mode or the built
    // production version.
    //
    // Unfortunately esbuild will print a warning. If you know how to remove the
    // warning while not replacing the value, please open an issue or PR!
    // 'process.env.NODE_ENV': '"process.env.NODE_ENV"',
  },
})

import * as path from 'path'
import * as url from 'url'
import * as fs from 'fs/promises'
import * as tmp from 'tmp'
import esbuild from 'esbuild'
import postcss from 'postcss'
import tailwindcssJit from '@tailwindcss/jit'
import postcssImport from 'postcss-import'

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

const postcssPlugins = [postcssImport(), tailwindcssJit()]

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
  plugins: [
    {
      name: 'postcss',
      setup: function (build) {
        const rootDir = process.cwd()
        const tmpDirPath = tmp.dirSync().name
        build.onResolve(
          { filter: /.\.(css)$/, namespace: 'file' },
          async (args) => {
            const sourceFullPath = path.resolve(args.resolveDir, args.path)
            const sourceExt = path.extname(sourceFullPath)
            const sourceBaseName = path.basename(sourceFullPath, sourceExt)
            const sourceDir = path.dirname(sourceFullPath)
            const sourceRelDir = path.relative(path.dirname(rootDir), sourceDir)

            const tmpDir = path.resolve(tmpDirPath, sourceRelDir)
            const tmpFilePath = path.resolve(tmpDir, `${sourceBaseName}.css`)
            await fs.mkdir(tmpDir, { recursive: true })

            const css = await fs.readFile(sourceFullPath)

            const result = await postcss(postcssPlugins).process(css, {
              from: sourceFullPath,
              to: tmpFilePath,
            })

            // Write result file
            await fs.writeFile(tmpFilePath, result.css)

            return {
              path: tmpFilePath,
            }
          },
        )
      },
    },
  ],
})

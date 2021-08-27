import { defineSirocConfig } from 'siroc'
import postcss from 'rollup-plugin-postcss'

export default defineSirocConfig({
  rollup: {
    plugins: [postcss({ extract: true })],
  },
})

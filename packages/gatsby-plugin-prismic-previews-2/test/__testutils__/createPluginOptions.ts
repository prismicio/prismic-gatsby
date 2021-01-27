import { PluginOptions } from '../../src'

export const createPluginOptions = (): PluginOptions => ({
  repositoryName: 'qwerty',
  accessToken: 'accessToken',
  typePrefix: 'prefix',
  apiEndpoint: 'apiEndpoint',
  lang: '*',
  toolbar: 'new',
  imageImgixParams: { q: 100 },
  imagePlaceholderImgixParams: { w: 10 },
  graphQuery: 'graphQuery',
  plugins: [],
})

import { PluginOptions } from '../../src'

export const createPluginOptions = (): PluginOptions => ({
  repositoryName: 'qwerty',
  accessToken: 'accessToken',
  typePrefix: 'prefix',
  apiEndpoint: 'https://qwerty.prismic.io/api/v2',
  lang: '*',
  toolbar: 'new',
  imageImgixParams: { q: 100 },
  imagePlaceholderImgixParams: { w: 10 },
  graphQuery: 'graphQuery',
  plugins: [],
})

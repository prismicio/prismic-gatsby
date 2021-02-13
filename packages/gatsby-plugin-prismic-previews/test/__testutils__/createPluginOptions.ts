import { PluginOptions } from '../../src'

export const createPluginOptions = (): PluginOptions => ({
  repositoryName: 'qwerty',
  accessToken: 'accessToken',
  apiEndpoint: 'https://qwerty.cdn.prismic.io/api/v2',
  typePrefix: 'prefix',
  lang: '*',
  toolbar: 'new',
  imageImgixParams: { q: 100 },
  imagePlaceholderImgixParams: { w: 10 },
  graphQuery: 'graphQuery',
  plugins: [],
})

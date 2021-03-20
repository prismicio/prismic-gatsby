import * as sinon from 'sinon'
import * as prismic from 'ts-prismic'

import { PluginOptions } from '../../src'

export const createPluginOptions = (): PluginOptions => ({
  repositoryName: 'qwerty',
  accessToken: 'accessToken',
  apiEndpoint: prismic.defaultEndpoint('qwerty'),
  typePrefix: 'prefix',
  lang: '*',
  toolbar: 'new',
  imageImgixParams: { q: 100 },
  imagePlaceholderImgixParams: { w: 10 },
  graphQuery: 'graphQuery',
  plugins: [],
  writeTypePathsToFilesystem: sinon.stub(),
})

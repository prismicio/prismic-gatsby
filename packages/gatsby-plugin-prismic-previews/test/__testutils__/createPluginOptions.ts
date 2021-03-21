import * as sinon from 'sinon'
import * as prismic from 'ts-prismic'

import { PluginOptions } from '../../src'

let i = 0

export const createPluginOptions = (): PluginOptions => {
  const repositoryName = 'qwerty'
  const apiEndpoint = prismic.defaultEndpoint(`${repositoryName}-${i}`)

  // Increment i to ensure the next call will create a unique apiEndpoint value.
  i = i + 1

  return {
    repositoryName,
    accessToken: 'accessToken',
    apiEndpoint,
    typePrefix: 'prefix',
    lang: '*',
    toolbar: 'new',
    imageImgixParams: { q: 100 },
    imagePlaceholderImgixParams: { w: 10 },
    graphQuery: 'graphQuery',
    plugins: [],
    writeTypePathsToFilesystem: sinon.stub(),
  }
}

import * as prismic from 'ts-prismic'

import {
  DEFAULT_IMGIX_PARAMS,
  DEFAULT_LANG,
  DEFAULT_PLACEHOLDER_IMGIX_PARAMS,
} from '../../src/constants'
import { PluginOptions } from '../../src/types'

let i = 0

export const createPluginOptions = (): PluginOptions => {
  const repositoryName = 'qwerty'
  const apiEndpoint = prismic.defaultEndpoint(`repositoryName-${i}`)

  // Increment i to ensure the next call will create a unique apiEndpoint value.
  i = i + 1

  return {
    repositoryName,
    accessToken: 'accessToken',
    apiEndpoint,
    typePrefix: 'prefix',
    schemas: {},
    lang: DEFAULT_LANG,
    webhookSecret: 'secret',
    imageImgixParams: DEFAULT_IMGIX_PARAMS,
    imagePlaceholderImgixParams: DEFAULT_PLACEHOLDER_IMGIX_PARAMS,
    linkResolver: () => 'linkResolver',
    htmlSerializer: () => 'htmlSerializer',
    plugins: [],
    createRemoteFileNode: () =>
      // @ts-expect-error - Partial FileSystemNode
      Promise.resolve({ id: 'remoteFileNodeId' }),
  }
}

import * as prismic from 'ts-prismic'

import {
  DEFAULT_IMGIX_PARAMS,
  DEFAULT_LANG,
  DEFAULT_PLACEHOLDER_IMGIX_PARAMS,
} from '../../src/constants'
import { PluginOptions } from '../../src/types'

export const createPluginOptions = (): PluginOptions => ({
  repositoryName: 'qwerty',
  accessToken: 'accessToken',
  apiEndpoint: prismic.defaultEndpoint('qwerty'),
  typePrefix: 'prefix',
  schemas: {},
  lang: DEFAULT_LANG,
  webhookSecret: 'secret',
  imageImgixParams: DEFAULT_IMGIX_PARAMS,
  imagePlaceholderImgixParams: DEFAULT_PLACEHOLDER_IMGIX_PARAMS,
  linkResolver: () => 'linkResolver',
  htmlSerializer: () => 'htmlSerializer',
  plugins: [],
})

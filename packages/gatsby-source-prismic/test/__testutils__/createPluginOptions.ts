import * as prismic from 'ts-prismic'

import {
  DEFAULT_IMGIX_PARAMS,
  DEFAULT_LANG,
  DEFAULT_PLACEHOLDER_IMGIX_PARAMS,
} from '../../src/constants'
import { PluginOptions, PrismicSchema } from '../../src/types'

import kitchenSinkSchema from '../__fixtures__/kitchenSinkSchema.json'

export const createPluginOptions = (): PluginOptions => ({
  repositoryName: 'qwerty',
  accessToken: 'accessToken',
  apiEndpoint: prismic.defaultEndpoint('qwerty'),
  typePrefix: 'prefix',
  schemas: {
    kitchen_sink: kitchenSinkSchema as PrismicSchema,
  },
  lang: DEFAULT_LANG,
  webhookSecret: 'secret',
  imageImgixParams: DEFAULT_IMGIX_PARAMS,
  imagePlaceholderImgixParams: DEFAULT_PLACEHOLDER_IMGIX_PARAMS,
  linkResolver: () => 'linkResolver',
  htmlSerializer: () => 'htmlSerializer',
  plugins: [],
})

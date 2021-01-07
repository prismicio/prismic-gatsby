import {
  DEFAULT_IMGIX_PARAMS,
  DEFAULT_LANG,
  DEFAULT_PLACEHOLDER_IMGIX_PARAMS,
} from '../../src/constants'
import { PluginOptions, PrismicSchema } from '../../src/types'
import schemaFixture from './schema.json'

export const pluginOptions: PluginOptions = {
  repositoryName: 'qwerty',
  accessToken: 'accessToken',
  typePrefix: 'prefix',
  schemas: {
    page: schemaFixture as PrismicSchema,
  },
  lang: DEFAULT_LANG,
  webhookSecret: 'secret',
  imageImgixParams: DEFAULT_IMGIX_PARAMS,
  imagePlaceholderImgixParams: DEFAULT_PLACEHOLDER_IMGIX_PARAMS,
  linkResolver: () => 'linkResolver',
  htmlSerializer: () => 'htmlSerializer',
  plugins: [],
}

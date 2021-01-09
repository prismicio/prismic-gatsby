import {
  DEFAULT_DOWNLOAD_LOCAL,
  DEFAULT_IMGIX_PARAMS,
  DEFAULT_LANG,
  DEFAULT_PLACEHOLDER_IMGIX_PARAMS,
} from '../../src/constants'
import { PluginOptions, PrismicSchema } from '../../src/types'
import schemaFixture from './schema.json'

export const pluginOptions: PluginOptions = {
  repositoryName: 'qwerty',
  accessToken: 'accessToken',
  apiEndpoint: 'https://qwerty.prismic.io/api/v2',
  typePrefix: 'prefix',
  schemas: {
    page: schemaFixture as PrismicSchema,
  },
  lang: DEFAULT_LANG,
  downloadLocal: DEFAULT_DOWNLOAD_LOCAL,
  webhookSecret: 'secret',
  imageImgixParams: DEFAULT_IMGIX_PARAMS,
  imagePlaceholderImgixParams: DEFAULT_PLACEHOLDER_IMGIX_PARAMS,
  linkResolver: () => 'linkResolver',
  htmlSerializer: () => 'htmlSerializer',
  plugins: [],
}

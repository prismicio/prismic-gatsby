export const GLOBAL_TYPE_PREFIX = 'Prismic'

export const PRISMIC_API_NON_DATA_FIELDS = ['uid']

export const PRISMIC_API_IMAGE_FIELDS = [
  'alt',
  'copyright',
  'dimensions',
  'url',
]

export const DEFAULT_IMGIX_PARAMS = {
  auto: 'compress,format',
  fit: 'max',
  q: 50,
} as const

export const DEFAULT_PLACEHOLDER_IMGIX_PARAMS = {
  w: 100,
  blur: 15,
} as const

export const DEFAULT_PRISMIC_API_ENDPOINT = `https://%s.prismic.io/api/v2`

export const DEFAULT_LANG = '*'

export const DEFAULT_FETCH_LINKS = [] as string[]

export const DEFAULT_DOWNLOAD_LOCAL = false

export const QUERY_PAGE_SIZE = 100

export const REPORTER_TEMPLATE = `gatsby-source-prismic(%s) - %s`

export const ANONYMOUS_REPORTER_TEMPLATE = `gatsby-source-prismic - %s`

export const TYPE_PATHS_CACHE_KEY_TEMPLATE = `type-paths %s`

export const LOCAL_FILE_CACHE_KEY_TEMPLATE = `local-file-node-id %s`

// Root node field used to compare static data with preview data. If values are
// equal, the preview node can be treated as an updated version of the static
// node.
export const PREVIEWABLE_NODE_ID_FIELD = '_previewable'

export const WEBHOOK_SECRET_MISMATCH_MSG =
  'A webhook was received, but the webhook secret did not match the webhook secret provided in the plugin options. If this is unexpected, verify that the `webhookSecret` plugin option matches the webhook secret in your Prismic repository.'

export const WEBHOOK_TEST_TRIGGER_SUCCESS_MSG =
  'Success! Received a test trigger webhook.'

export const MISSING_SCHEMAS_MSG =
  'JSON schemas for all custom types are required'

export const MISSING_SCHEMA_MSG = 'JSON schema for "%s" is missing'

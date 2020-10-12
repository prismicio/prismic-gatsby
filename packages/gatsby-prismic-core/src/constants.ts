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

export const QUERY_PAGE_SIZE = 100

export const REPORTER_TEMPLATE = `gatsby-source-prismic(%s) - %s`

export const ANONYMOUS_REPORTER_TEMPLATE = `gatsby-source-prismic - %s`

export const BROWSER_CREATE_NODE_ID_TEMPLATE = `gatsby-plugin-prismic-preview %s`

// Root node field used to compare static data with preview data. If values are
// equal, the preview node can be treated as an updated version of the static
// node.
export const PREVIEWABLE_NODE_ID_FIELD = '_previewable'

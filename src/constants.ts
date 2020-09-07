export const GLOBAL_TYPE_PREFIX = 'Prismic'

export const NON_DATA_FIELDS = ['uid']

export const DEFAULT_IMGIX_PARAMS = {
  auto: 'compress,format',
  fit: 'max',
  q: 50,
} as const

export const DEFAULT_PLACEHOLDER_IMGIX_PARAMS = {
  w: 100,
  blur: 15,
} as const

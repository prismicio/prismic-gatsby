import { struct } from 'superstruct'

import { PluginOptions, BrowserPluginOptions } from './types'

const baseSchema = {
  repositoryName: 'string',
  accessToken: 'string?',
  releaseID: 'string?',
  schemas: struct.record(['string', 'object']),
  linkResolver: 'function?',
  htmlSerializer: 'function?',
  fetchLinks: struct.optional(['string']),
  lang: 'string?',
  typePathsFilenamePrefix: 'string?',
  prismicToolbar: struct.optional(
    struct.union(['boolean', struct.enum(['legacy'])]),
  ),
  imageImgixParams: struct.record([
    'string',
    struct.union(['string', 'number', 'boolean', 'undefined']),
  ]),
  imagePlaceholderImgixParams: struct.record([
    'string',
    struct.union(['string', 'number', 'boolean', 'undefined']),
  ]),
}

const baseDefaults = {
  linkResolver: () => () => () => {},
  htmlSerializer: () => () => () => {},
  fetchLinks: [],
  lang: '*',
  typePathsFilenamePrefix: 'prismic-typepaths---',
  prismicToolbar: false,
  imageImgixParams: {
    auto: 'format,compress',
    fit: 'max',
    q: 50,
  },
  imagePlaceholderImgixParams: {
    w: 100,
    blur: 15,
    q: 20,
  },
}

const PluginOptionsValidator = struct(
  {
    ...baseSchema,
    shouldDownloadImage: 'function?',
    plugins: struct.size([0, 0]),
  },
  {
    ...baseDefaults,
    shouldDownloadImage: () => () => false,
    plugins: [],
  },
)

const BrowserOptionsValidator = struct(
  {
    ...baseSchema,
    pathResolver: 'function?',
    schemasDigest: 'string',
    plugins: struct.union([struct.literal(undefined), struct.size([0, 0])]),
  },
  baseDefaults,
)

export const validatePluginOptions = (pluginOptions: PluginOptions) =>
  PluginOptionsValidator(pluginOptions)

export const validateBrowserOptions = (browserOptions: BrowserPluginOptions) =>
  BrowserOptionsValidator(browserOptions)

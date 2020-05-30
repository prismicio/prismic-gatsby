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
}

const baseDefaults = {
  linkResolver: () => () => () => {},
  htmlSerializer: () => () => () => {},
  fetchLinks: [],
  lang: '*',
  typePathsFilenamePrefix: 'prismic-typepaths---',
  prismicToolbar: false,
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
  },
  baseDefaults,
)

export const validatePluginOptions = (pluginOptions: PluginOptions) =>
  PluginOptionsValidator(pluginOptions)

export const validateBrowserOptions = (browserOptions: BrowserPluginOptions) =>
  BrowserOptionsValidator(browserOptions)

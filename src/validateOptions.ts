import { struct } from 'superstruct'

import { PluginOptions, BrowserPluginOptions } from './types'

const baseSchema = {
  repositoryName: 'string',
  accessToken: 'string?',
  linkResolver: 'function?',
  htmlSerializer: 'function?',
  fetchLinks: struct.optional(['string']),
  lang: 'string?',
  typePathsFilenamePrefix: 'string?',
}

const baseDefaults = {
  linkResolver: () => () => () => {},
  htmlSerializer: () => () => () => {},
  fetchLinks: [],
  lang: '*',
  typePathsFilenamePrefix: 'prismic-typepaths---',
}

const PluginOptionsValidator = struct(
  {
    ...baseSchema,
    schemas: struct.record(['string', 'object']),
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

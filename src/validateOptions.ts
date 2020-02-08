import { struct } from 'superstruct'
import { PluginOptions } from './types'

const baseSchema = {
  repositoryName: 'string',
  accessToken: 'string?',
  linkResolver: 'function?',
  htmlSerializer: 'function?',
  fetchLinks: struct.optional(['string']),
  typePathsFilenamePrefix: 'string?',
}

const baseDefaults = {
  linkResolver: () => () => {},
  htmlSerializer: () => () => {},
  fetchLinks: [],
  typePathsFilenamePrefix: 'prismic-typepaths---',
}

const PluginOptionsValidator = struct(
  {
    ...baseSchema,
    schemas: struct.record(['string', 'object']),
    lang: 'string?',
    shouldDownloadImage: 'function?',
    plugins: struct.size([0, 0]),
  },
  {
    ...baseDefaults,
    lang: '*',
    shouldDownloadImage: () => false,
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

export const validateBrowserOptions = (browserOptions: object) =>
  BrowserOptionsValidator(browserOptions)

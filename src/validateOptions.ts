import { struct } from 'superstruct'

import { PluginOptions, BrowserPluginOptions } from './types'

const baseSchema = {
  repositoryName: 'string',
  accessToken: 'string?',
  schemas: struct.record(['string', 'object']),
  linkResolver: 'function?',
  htmlSerializer: 'function?',
  fetchLinks: struct.optional(['string']),
  lang: 'string?',
  typePathsFilenamePrefix: 'string?',
  imageImgixParams: struct.record([
    'string',
    struct.union(['string', 'number', 'boolean']),
  ]),
  imagePlaceholderImgixParams: struct.record([
    'string',
    struct.union(['string', 'number', 'boolean']),
  ]),
}

const baseDefaults = {
  linkResolver: () => () => () => {},
  htmlSerializer: () => () => () => {},
  fetchLinks: [],
  lang: '*',
  typePathsFilenamePrefix: 'prismic-typepaths---',
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
  },
  baseDefaults,
)

export const validatePluginOptions = (pluginOptions: PluginOptions) =>
  PluginOptionsValidator(pluginOptions)

export const validateBrowserOptions = (browserOptions: BrowserPluginOptions) =>
  BrowserOptionsValidator(browserOptions)

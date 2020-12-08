import * as struct from 'superstruct'

import { PluginOptions, BrowserPluginOptions } from './types'

const baseSchema = {
  repositoryName: struct.string(),
  accessToken: struct.optional(struct.string()),
  releaseID: struct.optional(struct.string()),
  schemas: struct.record(struct.string(), struct.object()),
  linkResolver: struct.defaulted(struct.func(), () => () => () => {}),
  htmlSerializer: struct.defaulted(struct.func(), () => () => () => {}),
  fetchLinks: struct.defaulted(struct.array(struct.string()), []),
  lang: struct.defaulted(struct.string(), '*'),
  typePathsFilenamePrefix: struct.defaulted(
    struct.string(),
    'prismic-typepaths---',
  ),
  prismicToolbar: struct.defaulted(
    struct.union([struct.boolean(), struct.enums(['legacy'])]),
    false,
  ),
  imageImgixParams: struct.defaulted(
    struct.record(
      struct.string(),
      struct.optional(
        struct.union([struct.string(), struct.number(), struct.boolean()]),
      ),
    ),
    { auto: 'format,compress', fit: 'max', q: 50 },
  ),
  imagePlaceholderImgixParams: struct.defaulted(
    struct.record(
      struct.string(),
      struct.optional(
        struct.union([struct.string(), struct.number(), struct.boolean()]),
      ),
    ),
    { w: 100, blur: 15, q: 20 },
  ),
  plugins: struct.defaulted(struct.empty(struct.array()), []),
} as const

const PluginOptions = struct.object({
  ...baseSchema,
  shouldDownloadImage: struct.defaulted(
    struct.optional(struct.func()),
    () => () => false,
  ),
  webhookSecret: struct.optional(struct.string()),
})

const BrowserPluginOptions = struct.object({
  ...baseSchema,
  pathResolver: struct.optional(struct.func()),
  schemasDigest: struct.string(),
})

export const validatePluginOptions = (pluginOptions: PluginOptions) => {
  const coerced = struct.coerce(pluginOptions, PluginOptions)
  struct.assert(coerced, PluginOptions)
  return (coerced as unknown) as PluginOptions
}

export const validateBrowserOptions = (
  browserOptions: BrowserPluginOptions,
) => {
  const coerced = struct.coerce(browserOptions, BrowserPluginOptions)
  struct.assert(coerced, BrowserPluginOptions)
  return (coerced as unknown) as BrowserPluginOptions
}

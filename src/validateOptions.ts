import * as struct from 'superstruct'

import { PluginOptions, BrowserPluginOptions } from './types'


const baseSchema = {
  repositoryName: struct.string(),
  accessToken: struct.optional(struct.string()),
  releaseID: struct.optional(struct.string()),
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
  customTypeToken: struct.string(),
  schemas: struct.record(struct.string(), struct.object()),
})

const BrowserPluginOptions = struct.object({
  ...baseSchema,
  pathResolver: struct.optional(struct.func()),
  schemasDigest: struct.string(),
})

export const validatePluginOptions = (pluginOptions: PluginOptions) => {
  // This could be done better
  const schemasOrTypeToken = struct.omit(PluginOptions, pluginOptions.customTypeToken ? ['schemas'] : ['customTypeToken'])
  const coerced = struct.create(pluginOptions, schemasOrTypeToken)
  struct.assert(coerced, schemasOrTypeToken)
  return (coerced as unknown) as PluginOptions
}

export const validateBrowserOptions = (
  browserOptions: BrowserPluginOptions,
) => {
  // needed although I don't think schemas or customTypes token are passed to the browser ?
  // const schemasOrTypeToken = struct.omit(BrowserPluginOptions, ['schemas'])
  const coerced = struct.create(browserOptions, BrowserPluginOptions)
  struct.assert(coerced, BrowserPluginOptions)
  return (coerced as unknown) as BrowserPluginOptions
}

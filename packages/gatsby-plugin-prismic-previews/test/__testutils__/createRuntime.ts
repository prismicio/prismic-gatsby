import * as gatsbyPrismicRuntime from 'gatsby-source-prismic/dist/runtime'

import { PluginOptions, PrismicRepositoryConfig } from '../../src'

export const createRuntime = (
  pluginOptions: PluginOptions,
  repositoryConfig?: PrismicRepositoryConfig,
): gatsbyPrismicRuntime.Runtime => {
  return gatsbyPrismicRuntime.createRuntime({
    typePrefix: pluginOptions.typePrefix,
    imageImgixParams: pluginOptions.imageImgixParams,
    imagePlaceholderImgixParams: pluginOptions.imagePlaceholderImgixParams,
    linkResolver: repositoryConfig?.linkResolver,
    htmlSerializer: repositoryConfig?.htmlSerializer,
    transformFieldName: repositoryConfig?.transformFieldName,
  })
}

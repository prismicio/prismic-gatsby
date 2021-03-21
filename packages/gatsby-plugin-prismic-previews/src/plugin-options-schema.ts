import * as gatsby from 'gatsby'
import * as prismic from 'ts-prismic'
import * as fs from 'fs/promises'

import * as gatsbyPrismic from '../../gatsby-source-prismic/src'

import { DEFAULT_PROMPT_FOR_ACCESS_TOKEN, DEFAULT_TOOLBAR } from './constants'
import { WriteTypePathsToFilesystemArgs } from './types'

export const pluginOptionsSchema: NonNullable<
  gatsby.GatsbyNode['pluginOptionsSchema']
> = function (args) {
  const { Joi } = args

  const schema = Joi.object({
    repositoryName: Joi.string().required(),
    accessToken: Joi.string(),
    promptForAccessToken: Joi.boolean().default(
      DEFAULT_PROMPT_FOR_ACCESS_TOKEN,
    ),
    apiEndpoint: Joi.string().default((parent) =>
      prismic.defaultEndpoint(parent.repositoryName),
    ),
    graphQuery: Joi.string(),
    fetchLinks: Joi.array().items(Joi.string().required()),
    lang: Joi.string().default(gatsbyPrismic.DEFAULT_LANG),
    imageImgixParams: Joi.object().default(gatsbyPrismic.DEFAULT_IMGIX_PARAMS),
    imagePlaceholderImgixParams: Joi.object().default(
      gatsbyPrismic.DEFAULT_PLACEHOLDER_IMGIX_PARAMS,
    ),
    typePrefix: Joi.string(),
    toolbar: Joi.string().valid('new', 'legacy').default(DEFAULT_TOOLBAR),
    writeTypePathsToFilesystem: Joi.function().default(
      () => async (args: WriteTypePathsToFilesystemArgs) =>
        await fs.writeFile(args.publicPath, args.serializedTypePaths),
    ),
  }).oxor('fetchLinks', 'graphQuery')

  return schema
}

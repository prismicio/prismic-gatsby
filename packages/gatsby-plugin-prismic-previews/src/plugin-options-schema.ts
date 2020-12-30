import * as gatsby from 'gatsby'
import {
  DEFAULT_IMGIX_PARAMS,
  DEFAULT_LANG,
  DEFAULT_PLACEHOLDER_IMGIX_PARAMS,
} from 'gatsby-source-prismic'

export const pluginOptionsSchema: NonNullable<
  gatsby.GatsbyNode['pluginOptionsSchema']
> = function (args) {
  const { Joi } = args

  const schema = Joi.object({
    repositoryName: Joi.string().required(),
    accessToken: Joi.string(),
    apiEndpoint: Joi.string(),
    releaseID: Joi.string(),
    fetchLinks: Joi.array().items(Joi.string().required()),
    graphQuery: Joi.string(),
    lang: Joi.string().default(DEFAULT_LANG),
    imageImgixParams: Joi.object().default(DEFAULT_IMGIX_PARAMS),
    imagePlaceholderImgixParams: Joi.object().default(
      DEFAULT_PLACEHOLDER_IMGIX_PARAMS,
    ),
    typePrefix: Joi.string(),
    toolbar: Joi.boolean().allow('legacy'),
  }).oxor('fetchLinks', 'graphQuery')

  return schema
}

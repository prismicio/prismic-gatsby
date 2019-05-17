import * as R from 'ramda'
import * as RA from 'ramda-adjunct'
import * as Joi from '@hapi/joi'

const schema = Joi.object().keys({
  repositoryName: Joi.string().required(),
  accessToken: Joi.string().required(),
  linkResolver: Joi.func().default(RA.noop),
  fetchLinks: Joi.array()
    .items(Joi.string())
    .default([]),
  htmlSerializer: Joi.func().default(RA.noop),
  schemas: Joi.object()
    .min(1)
    .required(),
  lang: Joi.string().default('*'),
  shouldNormalizeImage: Joi.func().default(R.always(true)),
  typePathsFilenamePrefix: Joi.string().default(
    ctx => `prismic-typepaths---${ctx.repositoryName}-`,
    'repository name',
  ),
  plugins: Joi.array()
    .length(0)
    .default([]),
})

export const validatePluginOptions = pluginOptions =>
  Joi.validate(pluginOptions, schema)

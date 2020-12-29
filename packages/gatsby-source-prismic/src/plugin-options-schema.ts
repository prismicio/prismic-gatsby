import * as gatsby from 'gatsby'
import * as RTE from 'fp-ts/ReaderTaskEither'
import * as E from 'fp-ts/Either'
import * as A from 'fp-ts/Array'
import * as R from 'fp-ts/Record'
import * as Eq from 'fp-ts/Eq'
import { constVoid, pipe } from 'fp-ts/function'

import {
  DEFAULT_IMGIX_PARAMS,
  DEFAULT_LANG,
  DEFAULT_PLACEHOLDER_IMGIX_PARAMS,
  MISSING_SCHEMAS_MSG,
  MISSING_SCHEMA_MSG,
} from './constants'
import { Dependencies, PluginOptions } from './types'
import { createClient } from './lib/createClient'
import { sprintf } from './lib/sprintf'

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
    linkResolver: Joi.function(),
    htmlSerializer: Joi.function(),
    schemas: Joi.object().required(),
    imageImgixParams: Joi.object().default(DEFAULT_IMGIX_PARAMS),
    imagePlaceholderImgixParams: Joi.object().default(
      DEFAULT_PLACEHOLDER_IMGIX_PARAMS,
    ),
    shouldDownloadImage: Joi.function(),
    typePrefix: Joi.string(),
    webhookSecret: Joi.string(),
  })
    .oxor('fetchLinks', 'graphQuery')
    .external(async (pluginOptions: PluginOptions) =>
      pipe(
        await RTE.run(externalValidationProgram(Joi), { pluginOptions }),
        E.fold((e) => {
          throw e
        }, constVoid),
      ),
    )

  return schema
}

const externalValidationProgram = (
  Joi: gatsby.PluginOptionsSchemaArgs['Joi'],
): RTE.ReaderTaskEither<
  Pick<Dependencies, 'pluginOptions'>,
  InstanceType<gatsby.PluginOptionsSchemaArgs['Joi']['ValidationError']>,
  void
> =>
  pipe(
    RTE.ask<Pick<Dependencies, 'pluginOptions'>>(),
    RTE.bind('client', createClient),
    RTE.bind('schemaTypes', (scope) =>
      pipe(scope.pluginOptions.schemas, R.keys, (types) => RTE.of(types)),
    ),
    RTE.bind('missingSchemas', (scope) =>
      pipe(
        scope.client.types,
        R.keys,
        A.difference(Eq.eqString)(scope.schemaTypes),
        (missingSchemas) => RTE.of(missingSchemas),
      ),
    ),
    RTE.chainW(
      RTE.fromPredicate(
        (scope) => A.isEmpty(scope.missingSchemas),
        (scope) =>
          new Joi.ValidationError(
            MISSING_SCHEMAS_MSG,
            scope.missingSchemas.map((missingSchema) => ({
              message: sprintf(MISSING_SCHEMA_MSG, missingSchema),
            })),
            scope.schemaTypes,
          ),
      ),
    ),
    RTE.map(constVoid),
  )

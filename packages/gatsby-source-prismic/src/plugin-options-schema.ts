import * as gatsby from 'gatsby'
import * as gatsbyFs from 'gatsby-source-filesystem'
import * as prismic from 'ts-prismic'
import * as RTE from 'fp-ts/ReaderTaskEither'
import * as TE from 'fp-ts/TaskEither'
import * as T from 'fp-ts/Task'
import * as A from 'fp-ts/Array'
import * as R from 'fp-ts/Record'
import * as struct from 'fp-ts/struct'
import * as string from 'fp-ts/string'
import { constVoid, pipe } from 'fp-ts/function'
import got from 'got'

import { sprintf } from './lib/sprintf'
import { throwError } from './lib/throwError'

import {
  DEFAULT_IMGIX_PARAMS,
  DEFAULT_LANG,
  DEFAULT_PLACEHOLDER_IMGIX_PARAMS,
  MISSING_SCHEMAS_MSG,
  MISSING_SCHEMA_MSG,
  COULD_NOT_ACCESS_MSG,
  PRISMIC_CUSTOM_TYPES_API_ENDPOINT,
} from './constants'
import {
  Dependencies,
  JoiValidationError,
  PluginOptions,
  PrismicCustomTypeApiResponse,
  PrismicSchema,
} from './types'

const getSchemasFromCustomTypeApiResponse = (
  response: PrismicCustomTypeApiResponse,
) =>
  R.fromFoldableMap(
    struct.getAssignSemigroup<PrismicSchema>(),
    A.Foldable,
  )(response, (item) => [item.id, item.json])

const externalCustomTypeFetchingProgram = (
  Joi: gatsby.PluginOptionsSchemaArgs['Joi'],
): RTE.ReaderTaskEither<
  Pick<Dependencies, 'pluginOptions'>,
  Error,
  PluginOptions
> =>
  pipe(
    RTE.ask<Pick<Dependencies, 'pluginOptions'>>(),
    RTE.filterOrElse(
      (deps) => Boolean(deps.pluginOptions.customTypeApiToken),
      () =>
        new Error(
          'No customTypeApiToken provided (skipping Custom Types API fetching)',
        ),
    ),
    RTE.bind('headers', (scope) =>
      RTE.of({
        repository: scope.pluginOptions.repositoryName,
        Authorization: `Bearer ${scope.pluginOptions.customTypeApiToken}`,
      }),
    ),
    RTE.bindW('response', (scope) =>
      RTE.fromTaskEither(
        TE.tryCatch(
          () =>
            got(PRISMIC_CUSTOM_TYPES_API_ENDPOINT, {
              headers: scope.headers,
            }).json<PrismicCustomTypeApiResponse>(),
          () =>
            new Joi.ValidationError(
              'Failed Custom Type API Request',
              [
                {
                  message:
                    'The Custom Type API could not be accessed. Please check that the customTypeApiToken provided is valid.',
                },
              ],
              scope.pluginOptions,
            ),
        ),
      ),
    ),
    RTE.bind('fetchedSchemas', (scope) =>
      RTE.of(getSchemasFromCustomTypeApiResponse(scope.response)),
    ),
    RTE.map((scope) => ({
      ...scope.pluginOptions,
      schemas: {
        ...scope.fetchedSchemas,
        ...scope.pluginOptions.schemas,
      },
    })),
  )

/**
 * To be executed during the `external` phase of `pluginOptionsSchema`.
 *
 * Validates plugin options for the following:
 *
 * - Access to the Prismic repository
 * - Missing custom type schemas
 */
const externalValidationProgram = (
  Joi: gatsby.PluginOptionsSchemaArgs['Joi'],
): RTE.ReaderTaskEither<
  Pick<Dependencies, 'pluginOptions'>,
  JoiValidationError,
  void
> =>
  pipe(
    RTE.ask<Pick<Dependencies, 'pluginOptions'>>(),
    RTE.bind('repositoryURL', (deps) =>
      RTE.right(
        prismic.buildRepositoryURL(
          deps.pluginOptions.apiEndpoint,
          deps.pluginOptions.accessToken,
        ),
      ),
    ),
    RTE.bind('repository', (scope) =>
      RTE.fromTaskEither(
        TE.tryCatch(
          () => got(scope.repositoryURL).json<prismic.Response.Repository>(),
          () =>
            new Joi.ValidationError(
              'Failed repository request',
              [{ message: COULD_NOT_ACCESS_MSG }],
              scope.repositoryURL,
            ),
        ),
      ),
    ),
    RTE.bind('schemaTypes', (scope) =>
      pipe(scope.pluginOptions.schemas, R.keys, (types) => RTE.right(types)),
    ),
    RTE.bind('missingSchemas', (scope) =>
      pipe(
        scope.repository.types,
        R.keys,
        A.difference(string.Eq)(scope.schemaTypes),
        (missingSchemas) => RTE.right(missingSchemas),
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

/**
 * Run during the bootstrap phase. Plugins can use this to define a schema for
 * their options using Joi to validate the options users pass to the plugin.
 *
 * @see https://www.gatsbyjs.com/docs/reference/config-files/gatsby-node/#pluginOptionsSchema
 */
export const pluginOptionsSchema: NonNullable<
  gatsby.GatsbyNode['pluginOptionsSchema']
> = (args) => {
  const { Joi } = args

  const schema = Joi.object({
    repositoryName: Joi.string().required(),
    accessToken: Joi.string(),
    customTypeApiToken: Joi.string(),
    apiEndpoint: Joi.string().default((parent) =>
      prismic.defaultEndpoint(parent.repositoryName),
    ),
    releaseID: Joi.string(),
    fetchLinks: Joi.array().items(Joi.string().required()),
    graphQuery: Joi.string(),
    lang: Joi.string().default(DEFAULT_LANG),
    linkResolver: Joi.function(),
    htmlSerializer: Joi.function(),
    schemas: Joi.object(),
    imageImgixParams: Joi.object().default(DEFAULT_IMGIX_PARAMS),
    imagePlaceholderImgixParams: Joi.object().default(
      DEFAULT_PLACEHOLDER_IMGIX_PARAMS,
    ),
    typePrefix: Joi.string(),
    webhookSecret: Joi.string(),
    createRemoteFileNode: Joi.function().default(
      () => gatsbyFs.createRemoteFileNode,
    ),
    transformFieldName: Joi.function().default(() => (fieldName: string) =>
      fieldName.replace(/-/g, '_'),
    ),
  })
    .or('schemas', 'customTypeApiToken')
    .oxor('fetchLinks', 'graphQuery')
    .external(
      async (pluginOptions: PluginOptions) =>
        await pipe(
          externalCustomTypeFetchingProgram(Joi)({ pluginOptions }),
          TE.fold(
            (error) =>
              // Non-ValidationErrors are used to as control flow, so we can
              // ignore the error if it isn't specifically one made for Joi.
              error instanceof Joi.ValidationError
                ? throwError(error)
                : T.of(void 0),
            (p) => T.of(p),
          ),
        )(),
    )
    .external(
      async (pluginOptions: PluginOptions) =>
        await pipe(
          externalValidationProgram(Joi)({ pluginOptions }),
          TE.fold(throwError, () => T.of(void 0)),
        )(),
    )

  return schema
}

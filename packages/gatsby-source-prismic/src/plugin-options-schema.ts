import * as gatsby from 'gatsby'
import * as gatsbyFs from 'gatsby-source-filesystem'
import * as prismic from '@prismicio/client'
import * as prismicT from '@prismicio/types'
import * as prismicCustomTypes from '@prismicio/custom-types-client'
import * as RTE from 'fp-ts/ReaderTaskEither'
import * as TE from 'fp-ts/TaskEither'
import * as T from 'fp-ts/Task'
import * as A from 'fp-ts/Array'
import * as R from 'fp-ts/Record'
import * as string from 'fp-ts/string'
import { constVoid, pipe } from 'fp-ts/function'
import fetch from 'node-fetch'

import { sprintf } from './lib/sprintf'
import { throwError } from './lib/throwError'

import {
  DEFAULT_IMGIX_PARAMS,
  DEFAULT_LANG,
  DEFAULT_PLACEHOLDER_IMGIX_PARAMS,
  MISSING_SCHEMAS_MSG,
  MISSING_SCHEMA_MSG,
} from './constants'
import { Dependencies, JoiValidationError, PluginOptions } from './types'

/**
 * Converts a Custom Type model to a mocked Custom Type API response object.
 * This is used as a way to ease migration from the `schemas` plugin option to
 * the `customTypeModels` plugin option.
 *
 * The `label`, `status`, and `repeatable` fields will **not** represent the
 * actual values from the Prismic repository. They will contain placeholder
 * values since that data is not available from just the Custom Type model.
 *
 * @param id API ID of the Custom Type.
 * @param model Model for the Custom Type.
 *
 * @returns The Custom Type model as if it came from the
 */
const customTypeModelToCustomType = (
  id: string,
  model: prismicT.CustomTypeModel,
): prismicCustomTypes.CustomType => ({
  id,
  json: model,
  // The following values are treated as filler values since we don't have this
  // metadata. They do **not** accurately represent the Custom Type.
  label: id,
  status: true,
  repeatable: true,
})

/**
 * To be execuring during the `external` phase of `pluginOptionsSchema`.
 *
 * Populates the `schemas` plugin option with JSON schemas fetched using
 * Prismic's Custom Types API. This will only happen if a valid
 * `customTypesApiToken` plugin option is provided.
 *
 * Schemas provided to the plugin via the `schemas` plugin option will be merged
 * over ones fetched from the API. In other words, provided schemas take
 * priority over automatically fetched ones.
 */
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
      (deps) => Boolean(deps.pluginOptions.customTypesApiToken),
      () =>
        new Error(
          'No customTypesApiToken provided (skipping Custom Types API fetching)',
        ),
    ),
    RTE.bind('client', (scope) =>
      RTE.of(
        prismicCustomTypes.createClient({
          repositoryName: scope.pluginOptions.repositoryName,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          token: scope.pluginOptions.customTypesApiToken!,
          endpoint: scope.pluginOptions.customTypesApiEndpoint,
          fetch,
        }),
      ),
    ),
    RTE.bindW('customTypes', (scope) =>
      RTE.fromTaskEither(
        TE.tryCatch(
          async () => await scope.client.getAll(),
          (error) =>
            new Joi.ValidationError(
              'Failed Custom Type API Request',
              [error as Error],
              scope.pluginOptions,
            ),
        ),
      ),
    ),
    RTE.bindW('sharedSlices', (scope) =>
      pipe(
        RTE.fromTaskEither(
          TE.tryCatch(
            async () => await scope.client.getAllSharedSlices(),
            (error) =>
              new Joi.ValidationError(
                'Failed Custom Type API Request',
                [error as Error],
                scope.pluginOptions,
              ),
          ),
        ),
      ),
    ),
    // TODO: Properly merge these by checking IDs.
    RTE.map((scope) => ({
      ...scope.pluginOptions,
      customTypeModels: [
        ...scope.customTypes,
        ...scope.pluginOptions.customTypeModels,
      ],
      sharedSliceModels: [
        ...scope.sharedSlices,
        ...scope.pluginOptions.sharedSliceModels,
      ],
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
    RTE.bind('client', (deps) =>
      RTE.right(
        prismic.createClient(
          deps.pluginOptions.apiEndpoint ??
            prismic.getEndpoint(deps.pluginOptions.repositoryName),
          {
            fetch,
            accessToken: deps.pluginOptions.accessToken,
          },
        ),
      ),
    ),
    RTE.chainFirst((scope) =>
      RTE.fromIO(() => {
        if (scope.pluginOptions.releaseID) {
          scope.client.queryContentFromReleaseByID(
            scope.pluginOptions.releaseID,
          )
        }
      }),
    ),
    RTE.bind('repository', (scope) =>
      RTE.fromTaskEither(
        TE.tryCatch(
          () => scope.client.getRepository(),
          (error) =>
            new Joi.ValidationError(
              'Failed repository request',
              [{ message: (error as Error).message }],
              scope.client.endpoint,
            ),
        ),
      ),
    ),
    RTE.bindW('schemaTypes', (scope) =>
      pipe(
        scope.pluginOptions.customTypeModels,
        A.map((model) => model.id),
        RTE.right,
      ),
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
    apiEndpoint: Joi.string().default((parent) =>
      prismic.getEndpoint(parent.repositoryName),
    ),
    customTypesApiToken: Joi.string(),
    customTypesApiEndpoint: Joi.string(),
    releaseID: Joi.string(),
    fetchLinks: Joi.array().items(Joi.string().required()),
    graphQuery: Joi.string(),
    lang: Joi.string().default(DEFAULT_LANG),
    linkResolver: Joi.function(),
    htmlSerializer: Joi.function(),
    schemas: Joi.object(),
    // If a user provides `schemas`, the default value will be converted from
    // `schemas` to something that appears to be from the Custom Types API.
    customTypeModels: Joi.array()
      .items(
        Joi.object({
          id: Joi.string().required(),
          json: Joi.object().required(),
        }).unknown(),
      )
      .default((parent) =>
        pipe(
          parent.schemas || {},
          R.collect(
            (id, schema) => [id, schema] as [string, prismicT.CustomTypeModel],
          ),
          A.map(([id, model]) => customTypeModelToCustomType(id, model)),
        ),
      ),
    sharedSliceModels: Joi.array()
      .items(
        Joi.object({
          id: Joi.string().required(),
          variations: Joi.array()
            .items(
              Joi.object({
                id: Joi.string().required(),
                primary: Joi.object(),
                items: Joi.object(),
              }).unknown(),
            )
            .required(),
        }).unknown(),
      )
      .default([]),
    imageImgixParams: Joi.object().default(DEFAULT_IMGIX_PARAMS),
    imagePlaceholderImgixParams: Joi.object().default(
      DEFAULT_PLACEHOLDER_IMGIX_PARAMS,
    ),
    typePrefix: Joi.string(),
    webhookSecret: Joi.string(),
    createRemoteFileNode: Joi.function().default(
      () => gatsbyFs.createRemoteFileNode,
    ),
    transformFieldName: Joi.function().default(
      () => (fieldName: string) => fieldName.replace(/-/g, '_'),
    ),
  })
    .or('customTypesApiToken', 'customTypeModels', 'schemas')
    .oxor('fetchLinks', 'graphQuery')
    .external(
      async (pluginOptions: PluginOptions) =>
        await pipe(
          externalCustomTypeFetchingProgram(Joi)({ pluginOptions }),
          TE.fold(
            (error) =>
              // Non-ValidationErrors are used for flow control, so we can
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

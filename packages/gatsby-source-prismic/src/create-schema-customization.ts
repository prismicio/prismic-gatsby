import * as gatsby from 'gatsby'
import * as RTE from 'fp-ts/ReaderTaskEither'
import * as TE from 'fp-ts/TaskEither'
import * as T from 'fp-ts/Task'
import * as A from 'fp-ts/Array'
import { pipe, constVoid } from 'fp-ts/function'

import { createAllDocumentTypesType } from './lib/createAllDocumentTypesType'
import { createCustomType } from './lib/createCustomType'
import { createSharedSlice } from './lib/createSharedSlice'
import { createTypePath } from './lib/createTypePath'
import { createTypes } from './lib/createTypes'
import { throwError } from './lib/throwError'

import { buildAlternateLanguageType } from './builders/buildAlternateLanguageType'
import { buildEmbedType } from './builders/buildEmbedType'
import { buildGeoPointType } from './builders/buildGeoPointType'
import { buildImageDimensionsType } from './builders/buildImageDimensionsType'
import { buildImageThumbnailType } from './builders/buildImageThumbnailType'
import { buildImgixImageTypes } from './builders/buildImgixImageTypes'
import { buildLinkType } from './builders/buildLinkType'
import { buildLinkTypeEnumType } from './builders/buildLinkTypeEnumType'
import { buildSharedSliceInterface } from './builders/buildSharedSliceInterface'
import { buildSliceInterface } from './builders/buildSliceInterface'
import { buildStructuredTextType } from './builders/buildStructuredTextType'
import { buildTypePathType } from './builders/buildTypePathType'

import { Dependencies, Mutable, PluginOptions } from './types'
import { buildDependencies } from './buildDependencies'

const GatsbyGraphQLTypeM = A.getMonoid<gatsby.GatsbyGraphQLType>()

/**
 * Create general types used by other types. Some types are global (i.e. not
 * repository-specific), while others are repository-specific, depending on
 * the type's use of custom plugin options.
 */
export const createBaseTypes: RTE.ReaderTaskEither<Dependencies, never, void> =
  pipe(
    RTE.ask<Dependencies>(),
    RTE.bind('baseTypes', () =>
      pipe(
        [
          buildAlternateLanguageType,
          buildEmbedType,
          buildGeoPointType,
          buildImageDimensionsType,
          buildImageThumbnailType,
          buildLinkType,
          buildLinkTypeEnumType,
          buildSliceInterface,
          buildSharedSliceInterface,
          buildStructuredTextType,
          buildTypePathType,
        ],
        RTE.sequenceArray,
      ),
    ),
    RTE.bind('imgixTypes', () => buildImgixImageTypes),
    RTE.map((scope) =>
      GatsbyGraphQLTypeM.concat(
        scope.baseTypes as Mutable<typeof scope.baseTypes>,
        scope.imgixTypes,
      ),
    ),
    RTE.chain(createTypes),
    RTE.map(constVoid),
  )

/**
 * Create types for all Custom Types using the JSON models provided at
 * `pluginOptions.customTypeModels`.
 */
const createCustomTypes: RTE.ReaderTaskEither<
  Dependencies,
  Error,
  gatsby.GatsbyGraphQLObjectType[]
> = pipe(
  RTE.asks((deps: Dependencies) => deps.pluginOptions.customTypeModels),
  RTE.map(A.map(createCustomType)),
  RTE.chain(RTE.sequenceArray),
  RTE.map((types) => types as Mutable<typeof types>),
)

/**
 * Create types for all Shared Slices using the JSON models provided at
 * `pluginOptions.sharedSliceModels`.
 */
const createSharedSlices: RTE.ReaderTaskEither<
  Dependencies,
  Error,
  gatsby.GatsbyGraphQLUnionType[]
> = pipe(
  RTE.asks((deps: Dependencies) => deps.pluginOptions.sharedSliceModels),
  RTE.map(A.map(createSharedSlice)),
  RTE.chain(RTE.sequenceArray),
  RTE.map((types) => types as Mutable<typeof types>),
)

const createTypePaths: RTE.ReaderTaskEither<Dependencies, Error, void> = pipe(
  RTE.ask<Dependencies>(),
  RTE.chainFirst((scope) =>
    RTE.right(
      scope.runtime.registerCustomTypeModels(
        scope.pluginOptions.customTypeModels,
      ),
    ),
  ),
  RTE.chainFirst((scope) =>
    RTE.right(
      scope.runtime.registerSharedSliceModels(
        scope.pluginOptions.sharedSliceModels,
      ),
    ),
  ),
  RTE.bind('typePaths', (scope) => RTE.right(scope.runtime.typePaths)),
  RTE.chainFirstW((scope) =>
    pipe(scope.typePaths, A.map(createTypePath), RTE.sequenceArray),
  ),
  RTE.map(constVoid),
)

/**
 * To be executed in the `createSchemaCustomization` API.
 */
const createSchemaCustomizationProgram: RTE.ReaderTaskEither<
  Dependencies,
  Error,
  void
> = pipe(
  RTE.ask<Dependencies>(),
  RTE.chainFirst(() => createBaseTypes),
  RTE.chainFirst(() => createSharedSlices),
  RTE.bind('customTypeTypes', () => createCustomTypes),
  RTE.chainFirstW((scope) => createAllDocumentTypesType(scope.customTypeTypes)),
  RTE.chainFirst(() => createTypePaths),
  RTE.map(constVoid),
)

/**
 * Create all GraphQL types for the plugin's configured Prismic repository.
 *
 * @see https://www.gatsbyjs.com/docs/reference/config-files/gatsby-node/#createSchemaCustomization
 */
export const createSchemaCustomization: NonNullable<
  gatsby.GatsbyNode['createSchemaCustomization']
> = async (
  gatsbyContext: gatsby.CreateSchemaCustomizationArgs,
  pluginOptions: PluginOptions,
) =>
  await pipe(
    createSchemaCustomizationProgram(
      buildDependencies(gatsbyContext, pluginOptions),
    ),
    TE.fold(throwError, () => T.of(void 0)),
  )()

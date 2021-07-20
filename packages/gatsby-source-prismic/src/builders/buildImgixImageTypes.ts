import * as gatsby from 'gatsby'
import * as imgixGatsby from '@imgix/gatsby/dist/pluginHelpers'
import * as RTE from 'fp-ts/ReaderTaskEither'
import * as A from 'fp-ts/Array'
import { pipe } from 'fp-ts/function'

import { Dependencies } from '../types'

/**
 * Builds a list of Imgix GraphQL types used by Image Custom Type fields. The
 * resulting types can be created using Gatsby's `createTypes` action.
 */
// TODO: Move typename to Dependencies (create in `buildDependencies.ts`).
export const buildImgixImageTypes: RTE.ReaderTaskEither<
  Dependencies,
  never,
  gatsby.GatsbyGraphQLType[]
> = pipe(
  RTE.ask<Dependencies>(),
  RTE.bind('imgixTypes', (scope) =>
    RTE.right(
      // IMPORTANT: These options need to be kept in sync with the options at
      // packages/gatsby-source-prismic/src/builders/buildImageBaseFieldConfigMap.ts
      imgixGatsby.createImgixGatsbyTypes({
        cache: scope.cache,
        resolveUrl: () => '', // Doesn't matter
        namespace: 'Imgix',
      }),
    ),
  ),
  RTE.bind('objectTypes', (scope) =>
    RTE.right(
      pipe(scope.imgixTypes.types, A.map(scope.schema.buildObjectType)),
    ),
  ),
  RTE.bind('enumTypes', (scope) =>
    RTE.right(
      pipe(scope.imgixTypes.enumTypes, A.map(scope.schema.buildEnumType)),
    ),
  ),
  RTE.bind('inputTypes', (scope) =>
    RTE.right(
      pipe(
        scope.imgixTypes.inputTypes,
        A.map(scope.schema.buildInputObjectType),
      ),
    ),
  ),
  RTE.map((scope) => [
    ...scope.objectTypes,
    ...scope.enumTypes,
    ...scope.inputTypes,
  ]),
)

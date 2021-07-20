import * as gatsby from 'gatsby'
import * as RTE from 'fp-ts/ReaderTaskEither'
import { pipe } from 'fp-ts/function'

import { Dependencies } from '../types'
import { buildObjectType } from '../lib/buildObjectType'

import { buildImageBaseFieldConfigMap } from './buildImageBaseFieldConfigMap'

/**
 * Builds a GraphQL type used by an Image field's thumbnails. The resulting type
 * can be created using Gatsby's `createTypes` action.
 */
// TODO: Move typename to Dependencies (create in `buildDependencies.ts`).
export const buildImageThumbnailType: RTE.ReaderTaskEither<
  Dependencies,
  never,
  gatsby.GatsbyGraphQLType
> = pipe(
  RTE.ask<Dependencies>(),
  RTE.bind('imageFields', () => buildImageBaseFieldConfigMap),
  RTE.chain((scope) =>
    buildObjectType({
      name: scope.nodeHelpers.createTypeName('ImageThumbnailType'),
      fields: scope.imageFields,
    }),
  ),
)

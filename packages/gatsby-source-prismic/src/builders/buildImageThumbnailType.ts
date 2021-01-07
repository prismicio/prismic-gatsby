import * as gatsby from 'gatsby'
import * as RTE from 'fp-ts/ReaderTaskEither'
import { pipe } from 'fp-ts/function'

import { Dependencies } from '../types'
import { buildObjectType } from '../lib/buildObjectType'

import { buildBaseImageFieldConfigMap } from './buildBaseImageFieldConfigMap'

export const buildImageThumbnailType: RTE.ReaderTaskEither<
  Dependencies,
  never,
  gatsby.GatsbyGraphQLType
> = pipe(
  RTE.ask<Dependencies>(),
  RTE.bind('imageFields', () => buildBaseImageFieldConfigMap),
  RTE.chain((scope) =>
    buildObjectType({
      name: scope.nodeHelpers.createTypeName('ImageThumbnailType'),
      fields: scope.imageFields,
    }),
  ),
)

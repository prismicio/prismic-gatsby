import * as gatsby from 'gatsby'
import * as RTE from 'fp-ts/ReaderTaskEither'
import { pipe } from 'fp-ts/function'

import { Dependencies } from '../types'
import { buildObjectType } from '../lib/buildObjectType'

import { buildImageBaseFieldConfigMap } from './buildImageBaseFieldConfigMap'

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

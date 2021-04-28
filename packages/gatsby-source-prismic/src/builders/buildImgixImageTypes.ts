import * as gatsby from 'gatsby'
import * as gatsbyImgix from 'gatsby-plugin-imgix/dist/node'
import * as RTE from 'fp-ts/ReaderTaskEither'
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
  RTE.asks((deps) =>
    gatsbyImgix.createImgixTypes({
      fixedTypeName: deps.nodeHelpers.createTypeName('ImageFixedType'),
      fluidTypeName: deps.nodeHelpers.createTypeName('ImageFluidType'),
      paramsInputTypeName: deps.globalNodeHelpers.createTypeName(
        'ImgixUrlParamsInput',
      ),
      cache: deps.cache,
      schema: deps.schema,
    }),
  ),
)

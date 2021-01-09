import * as gatsby from 'gatsby'
import * as gatsbyImgix from 'gatsby-plugin-imgix/dist/node'
import * as RTE from 'fp-ts/ReaderTaskEither'
import { pipe } from 'fp-ts/function'

import { Dependencies } from '../types'

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

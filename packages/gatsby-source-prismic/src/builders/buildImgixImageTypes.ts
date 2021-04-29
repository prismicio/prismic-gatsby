import * as gatsby from 'gatsby'
import * as imgixGatsby from '@imgix/gatsby/dist/pluginHelpers'
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
  RTE.asks((deps) => {
    const imgixTypes = imgixGatsby.createImgixGatsbyTypes({
      cache: deps.cache,
      resolveUrl: () => '',
      namespace: 'Imgix',
    })

    return [
      ...imgixTypes.types.map(deps.schema.buildObjectType),
      ...imgixTypes.enumTypes.map(deps.schema.buildEnumType),
      ...imgixTypes.inputTypes.map(deps.schema.buildInputObjectType),
    ]
  }),
)

import * as gatsby from 'gatsby'
import * as RTE from 'fp-ts/ReaderTaskEither'
import { pipe } from 'fp-ts/function'

import { Dependencies } from '../types'
import { buildObjectType } from '../lib/buildObjectType'

/**
 * Builds a GraphQL type used by Image fields for their `dimensions` field. The
 * resulting type can be created using Gatsby's `createTypes` action.
 */
// TODO: Move typename to Dependencies (create in `buildDependencies.ts`).
export const buildImageDimensionsType: RTE.ReaderTaskEither<
  Dependencies,
  never,
  gatsby.GatsbyGraphQLType
> = pipe(
  RTE.ask<Dependencies>(),
  RTE.chain((deps) =>
    buildObjectType({
      name: deps.globalNodeHelpers.createTypeName('ImageDimensionsType'),
      fields: {
        width: 'Int!',
        height: 'Int!',
      },
    }),
  ),
)

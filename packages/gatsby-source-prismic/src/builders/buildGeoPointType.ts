import * as gatsby from 'gatsby'
import * as RTE from 'fp-ts/ReaderTaskEither'
import { pipe } from 'fp-ts/function'

import { buildObjectType } from '../lib/buildObjectType'

import { Dependencies } from '../types'

/**
 * Builds a GraphQL type used by GeoPoint fields. The resulting type can be
 * created using Gatsby's `createTypes` action.
 */
// TODO: Move typename to Dependencies (create in `buildDependencies.ts`).
export const buildGeoPointType: RTE.ReaderTaskEither<
  Dependencies,
  never,
  gatsby.GatsbyGraphQLType
> = pipe(
  RTE.ask<Dependencies>(),
  RTE.chain((deps) =>
    buildObjectType({
      name: deps.globalNodeHelpers.createTypeName('GeoPointType'),
      fields: {
        longitude: 'Float!',
        latitude: 'Float!',
      },
    }),
  ),
)

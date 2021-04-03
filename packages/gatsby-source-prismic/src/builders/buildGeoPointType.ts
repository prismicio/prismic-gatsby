import * as gatsby from 'gatsby'
import * as RTE from 'fp-ts/ReaderTaskEither'
import { pipe } from 'fp-ts/function'

import { buildObjectType } from '../lib/buildObjectType'

import { Dependencies } from '../types'

export const buildGeoPointType: RTE.ReaderTaskEither<
  Dependencies,
  never,
  gatsby.GatsbyGraphQLType
> = pipe(
  RTE.ask<Dependencies>(),
  RTE.chain((deps) =>
    buildObjectType({
      name: deps.globalNodeHelpers.createTypeName('GeoPointType'),
      fields: { longitude: 'Float!', latitude: 'Float!' },
    }),
  ),
)

import * as gatsby from 'gatsby'
import * as RTE from 'fp-ts/ReaderTaskEither'
import * as A from 'fp-ts/Array'
import { pipe, constVoid } from 'fp-ts/function'

import { Dependencies } from '../types'
import { buildEnumType } from './buildEnumType'
import { registerTypes } from './registerTypes'
import { buildObjectType } from './buildObjectType'

const buildLinkTypesUnionType: RTE.ReaderTaskEither<
  Dependencies,
  never,
  gatsby.GatsbyGraphQLType
> = pipe(
  RTE.ask<Dependencies>(),
  RTE.chain((deps) =>
    buildEnumType({
      name: deps.globalNodeHelpers.createTypeName('LinkTypes'),
      values: { Any: {}, Document: {}, Media: {}, Web: {} },
    }),
  ),
)

const buildGeoPointType: RTE.ReaderTaskEither<
  Dependencies,
  never,
  gatsby.GatsbyGraphQLType
> = pipe(
  RTE.ask<Dependencies>(),
  RTE.chain((deps) =>
    buildEnumType({
      name: deps.globalNodeHelpers.createTypeName('LinkTypes'),
      values: { Any: {}, Document: {}, Media: {}, Web: {} },
    }),
  ),
)

const buildImageDimensionsType: RTE.ReaderTaskEither<
  Dependencies,
  never,
  gatsby.GatsbyGraphQLType
> = pipe(
  RTE.ask<Dependencies>(),
  RTE.chain((deps) =>
    buildObjectType({
      name: deps.globalNodeHelpers.createTypeName('GeoPointType'),
      fields: { longitude: 'Int!', latitude: 'Int!' },
    }),
  ),
)

export const createBaseTypes = (): RTE.ReaderTaskEither<
  Dependencies,
  never,
  void
> =>
  pipe(
    [buildLinkTypesUnionType, buildGeoPointType, buildImageDimensionsType],
    A.sequence(RTE.readerTaskEither),
    RTE.chain(registerTypes),
    RTE.map(constVoid),
  )

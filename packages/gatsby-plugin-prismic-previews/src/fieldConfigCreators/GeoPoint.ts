import * as RTE from 'fp-ts/ReaderTaskEither'
import { pipe } from 'fp-ts/function'

import { buildObjectType } from '../lib/buildObjectType'
import { registerType } from '../lib/registerType'
import { getTypeName } from '../lib/getTypeName'

import { Dependencies, FieldConfigCreator } from '../types'

export const createGeoPointFieldConfig: FieldConfigCreator = () =>
  pipe(
    RTE.ask<Dependencies>(),
    RTE.chain((deps) =>
      buildObjectType({
        name: deps.globalNodeHelpers.createTypeName('GeoPointType'),
        fields: {
          longitude: 'Float',
          latitude: 'Float',
        },
      }),
    ),
    RTE.chainFirst(registerType),
    RTE.map(getTypeName),
  )

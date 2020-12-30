import * as RTE from 'fp-ts/ReaderTaskEither'
import { pipe } from 'fp-ts/function'

import { buildObjectType } from '../lib/buildObjectType'
import { registerType } from '../lib/registerType'
import { getTypeName } from '../lib/getTypeName'
import { createTypePath } from '../lib/createTypePath'

import { Dependencies, FieldConfigCreator, PrismicFieldType } from '../types'

export const createGeoPointFieldConfig: FieldConfigCreator = (path) =>
  pipe(
    RTE.ask<Dependencies>(),
    RTE.chainFirst(() => createTypePath(path, PrismicFieldType.Embed)),
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

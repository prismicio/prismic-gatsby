import * as RTE from 'fp-ts/ReaderTaskEither'
import { pipe } from 'fp-ts/function'

import { Dependencies, FieldConfigCreator } from '../types'

/**
 * Builds a GraphQL field configuration object for a GeoPoint Custom Type
 * field. The resulting configuration object can be used in a GraphQL type.
 *
 * This function registers a typepath for the field.
 *
 * @param path Path to the field.
 *
 * @returns GraphQL field configuration object.
 */
// TODO: Move typename to Dependencies (create in `buildDependencies.ts`).
export const buildGeoPointFieldConfig: FieldConfigCreator = () =>
  pipe(
    RTE.ask<Dependencies>(),
    RTE.map((deps) => deps.globalNodeHelpers.createTypeName('GeoPointType')),
  )

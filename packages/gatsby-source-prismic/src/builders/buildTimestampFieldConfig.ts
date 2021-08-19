import * as RTE from 'fp-ts/ReaderTaskEither'

import { FieldConfigCreator } from '../types'

/**
 * Builds a GraphQL field configuration object for a Timestamp Custom Type
 * field. It includes Gatsby's `@dateformat` extension. The resulting
 * configuration object can be used in a GraphQL type.
 *
 * This function registers a typepath for the field.
 *
 * @param path Path to the field.
 *
 * @returns GraphQL field configuration object.
 */
export const buildTimestampFieldConfig: FieldConfigCreator = () =>
  RTE.right({
    type: 'Date',
    extensions: { dateformat: {} },
  })

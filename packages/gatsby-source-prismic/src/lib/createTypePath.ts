import * as RTE from 'fp-ts/ReaderTaskEither'

import { Dependencies, PrismicFieldType } from '../types'

/**
 * Creates a type path using the environment's `createTypePath` function.
 *
 * @param path Path to the field.
 * @param type Type of the field.
 */
export const createTypePath = (
  path: string[],
  type: PrismicFieldType,
): RTE.ReaderTaskEither<Dependencies, never, void> =>
  RTE.asks((deps) => deps.createTypePath(path, type))

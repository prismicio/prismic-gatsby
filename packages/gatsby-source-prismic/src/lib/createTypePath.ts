import * as RTE from 'fp-ts/ReaderTaskEither'

import { Dependencies, PrismicTypePathType } from '../types'

/**
 * Creates a type path using the environment's `createTypePath` function.
 *
 * @param path Path to the field.
 * @param type Type of the field.
 */
export const createTypePath = (
  path: string[],
  type: PrismicTypePathType,
): RTE.ReaderTaskEither<Dependencies, never, void> =>
  RTE.asks((deps) => deps.createTypePath(path, type))

import * as RTE from 'fp-ts/ReaderTaskEither'
import { constVoid, pipe } from 'fp-ts/function'

import { createNodeOfType } from './createNodeOfType'

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
  pipe(
    RTE.right({ id: path.toString(), path, type }),
    RTE.chain((node) => createNodeOfType(node, 'TypePathType')),
    RTE.map(constVoid),
  )

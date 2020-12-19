import * as gatsby from 'gatsby'
import * as RTE from 'fp-ts/ReaderTaskEither'

import { Dependencies } from '../types'

/**
 * Registers one or more types using the environment's `createTypes` function.
 *
 * @param types GraphQL types to create.
 */
export const registerTypes = <A extends gatsby.GatsbyGraphQLType>(
  types: A[],
): RTE.ReaderTaskEither<Dependencies, never, void> =>
  RTE.asks((deps) => deps.createTypes(types))

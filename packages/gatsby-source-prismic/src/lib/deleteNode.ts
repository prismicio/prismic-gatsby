import * as gatsby from 'gatsby'
import * as RTE from 'fp-ts/ReaderTaskEither'

import { Dependencies } from '../types'

/**
 * Deletes a node using the environment's `deleteNode` function.
 *
 * @param node Node to delete.
 */
// TODO: As of Gatsby v3, `deleteNode` should receive the node as its only
// argument, not wrapped in an object.
export const deleteNode = (
  node: gatsby.Node,
): RTE.ReaderTaskEither<Dependencies, never, void> =>
  RTE.asks((deps) => deps.deleteNode({ node }))

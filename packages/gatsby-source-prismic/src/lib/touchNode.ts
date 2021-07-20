import * as gatsby from 'gatsby'
import * as RTE from 'fp-ts/ReaderTaskEither'

import { Dependencies } from '../types'

/**
 * Touches a node using the environment's `touchNode` function.
 *
 * @param nodeId ID of the node to touch.
 */
export const touchNode = (
  node: gatsby.Node,
): RTE.ReaderTaskEither<Dependencies, never, void> =>
  RTE.asks((deps) => deps.touchNode(node))

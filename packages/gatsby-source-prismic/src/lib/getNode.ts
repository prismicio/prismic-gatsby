import * as gatsby from 'gatsby'
import * as RTE from 'fp-ts/ReaderTaskEither'

import { Dependencies } from '../types'

/**
 * Returns a node using the environment's `getNode` function.
 *
 * @param nodeId ID of the node to return.
 */
export const getNode = (
  nodeId: string,
): RTE.ReaderTaskEither<Dependencies, never, gatsby.Node | undefined> =>
  RTE.asks((deps) => deps.getNode(nodeId))

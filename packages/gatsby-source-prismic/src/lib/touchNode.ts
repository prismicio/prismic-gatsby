import * as RTE from 'fp-ts/ReaderTaskEither'

import { Dependencies } from '../types'

/**
 * Touches a node using the environment's `touchNode` function.
 *
 * @param nodeId ID of the node to touch.
 */
// TODO: As of Gatsby v3, `touchNode` should be passed the full node, not just
// the `nodeId`.
// See: https://www.gatsbyjs.com/docs/reference/release-notes/migrating-from-v2-to-v3/#touchnode
export const touchNode = (
  nodeId: string,
): RTE.ReaderTaskEither<Dependencies, never, void> =>
  RTE.asks((deps) => deps.touchNode({ nodeId }))

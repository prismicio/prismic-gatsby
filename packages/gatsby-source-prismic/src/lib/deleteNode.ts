import * as gatsby from 'gatsby'
import * as RTE from 'fp-ts/ReaderTaskEither'

import { Dependencies } from '../types'

/**
 * Deletes a node using the environment's `deleteNode` function.
 *
 * @param node Node to delete.
 */
export const deleteNode = (
  node: gatsby.Node,
): RTE.ReaderTaskEither<Dependencies, never, void> =>
  RTE.asks((deps) => {
    console.log('Deleting node with Prismic ID: ', node.prismicId)

    return deps.deleteNode(node)
  })

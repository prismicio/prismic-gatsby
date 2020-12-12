import * as RTE from 'fp-ts/ReaderTaskEither'
import * as A from 'fp-ts/Array'
import { flow } from 'fp-ts/function'

import { deleteNode } from './deleteNode'

/**
 * Deletes one or more nodes.
 *
 * @see gatsby-source-prismic/lib/deleteNode.ts
 */
export const deleteNodes = flow(
  A.map(deleteNode),
  A.sequence(RTE.readerTaskEither),
)

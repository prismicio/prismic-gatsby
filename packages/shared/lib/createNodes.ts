import * as RTE from 'fp-ts/ReaderTaskEither'
import * as A from 'fp-ts/Array'
import { flow, constVoid } from 'fp-ts/function'

import { createNode } from './createNode'

/**
 * Creates one or more nodes.
 *
 * @see gatsby-source-prismic/lib/createNode.ts
 */
export const createNodes = flow(
  A.map(createNode),
  A.sequence(RTE.readerTaskEither),
  RTE.map(constVoid),
)

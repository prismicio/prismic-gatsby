import * as RTE from 'fp-ts/ReaderTaskEither'
import * as A from 'fp-ts/Array'
import { flow } from 'fp-ts/function'

import { normalizeDocument } from './normalizeDocument'

/**
 * Creates one or more nodes.
 *
 * @see gatsby-source-prismic/lib/createNode.ts
 */
export const normalizeDocuments = flow(
  A.map(normalizeDocument),
  A.sequence(RTE.readerTaskEither),
)

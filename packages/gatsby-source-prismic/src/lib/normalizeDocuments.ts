import * as RTE from 'fp-ts/ReaderTaskEither'
import * as A from 'fp-ts/Array'
import { flow } from 'fp-ts/function'

import { normalizeDocument } from './normalizeDocument'

/**
 * Normalizes one or more documents.
 *
 * @see gatsby-source-prismic/lib/normalizeDocument.ts
 */
export const normalizeDocuments = flow(
  A.map(normalizeDocument),
  RTE.sequenceArray,
)

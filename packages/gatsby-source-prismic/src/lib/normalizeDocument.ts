import * as prismic from 'ts-prismic'
import * as RTE from 'fp-ts/ReaderTaskEither'
import { pipe } from 'fp-ts/function'

import { Dependencies } from '../types'
import { normalizeDocumentSubtree } from './normalizeDocumentSubtree'

/**
 * Type guard to verify that the given value is a valid Prismic document.
 */
const documentRefinement = (value: unknown): value is prismic.Document =>
  typeof value === 'object' &&
  value !== null &&
  !Array.isArray(value) &&
  'data' in value &&
  'type' in value

/**
 * Normalizes values of a Prismic document where necessary.
 *
 * @see gatsby-source-prismic/lib/normalizeDocumentSubtree.ts
 *
 * @param doc Prismic document to normalize.
 *
 * @returns Normalized Prismic document.
 */
export const normalizeDocument = (
  doc: prismic.Document,
): RTE.ReaderTaskEither<Dependencies, Error, prismic.Document> =>
  pipe(
    normalizeDocumentSubtree([doc.type], doc),
    RTE.chainW(
      RTE.fromPredicate(
        documentRefinement,
        () =>
          new Error(
            'Document shape is no longer a Document after normalization',
          ),
      ),
    ),
  )

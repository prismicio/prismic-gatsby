import * as RTE from 'fp-ts/ReaderTaskEither'
import { constVoid, pipe } from 'fp-ts/function'
import {
  createNodes,
  Dependencies,
  queryDocumentsByIds,
} from 'gatsby-prismic-core'

/**
 * Queries documents in a list of document IDs from the environment's Prismic
 * repository and creates nodes for each document.
 */
export const sourceNodesForDocumentIds = (
  documentIds: string[],
): RTE.ReaderTaskEither<Dependencies, never, void> =>
  pipe(
    queryDocumentsByIds(documentIds),
    RTE.chain(createNodes),
    RTE.map(constVoid),
  )

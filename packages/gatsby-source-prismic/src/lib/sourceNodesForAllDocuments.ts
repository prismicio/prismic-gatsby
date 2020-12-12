import * as RTE from 'fp-ts/ReaderTaskEither'
import { constVoid, pipe } from 'fp-ts/function'
import {
  createNodes,
  Dependencies,
  queryAllDocuments,
} from 'gatsby-prismic-core'

/**
 * Queries all documents from the environment's Prismic repository and creates
 * nodes for each document.
 */
export const sourceNodesForAllDocuments = (): RTE.ReaderTaskEither<
  Dependencies,
  never,
  void
> => pipe(queryAllDocuments(), RTE.chain(createNodes), RTE.map(constVoid))

import * as RTE from 'fp-ts/ReaderTaskEither'
import { pipe, constVoid } from 'fp-ts/function'

import { Dependencies, Mutable } from '../types'

import { createGloballyUniqueNodes } from './createGloballyUniqueNodes'
import { normalizeDocuments } from './normalizeDocuments'
import { queryAllDocuments } from './queryAllDocuments'

/**
 * Queries all documents from the environment's Prismic repository and creates
 * nodes for each document.
 */
export const sourceNodesForAllDocuments: RTE.ReaderTaskEither<
  Dependencies,
  Error,
  void
> = pipe(
  queryAllDocuments,
  RTE.chainW(normalizeDocuments),
  RTE.chainW((docs) => createGloballyUniqueNodes(docs as Mutable<typeof docs>)),
  RTE.map(constVoid),
)

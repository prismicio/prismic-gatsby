import * as RTE from 'fp-ts/ReaderTaskEither'
import { pipe, constVoid } from 'fp-ts/function'

import { Dependencies } from '../types'

import { createNodes } from './createNodes'
import { queryAllDocuments } from './queryAllDocuments'
import { normalizeDocuments } from './normalizeDocuments'

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
  RTE.chainW(createNodes),
  RTE.map(constVoid),
)

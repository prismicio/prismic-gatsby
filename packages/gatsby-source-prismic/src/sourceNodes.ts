import * as RTE from 'fp-ts/ReaderTaskEither'
import { pipe, flow, constVoid } from 'fp-ts/function'

import {
  Dependencies,
  registerCustomTypes,
  queryAllDocuments,
  createNodes,
  registerAllDocumentTypes,
  createBaseTypes,
} from 'gatsby-prismic-core'

export const sourceNodes: RTE.ReaderTaskEither<
  Dependencies,
  never,
  void
> = pipe(
  RTE.ask<Dependencies>(),
  RTE.chainFirst(createBaseTypes),
  RTE.chainFirst(
    flow(registerCustomTypes, RTE.chain(registerAllDocumentTypes)),
  ),
  RTE.chain(flow(queryAllDocuments, RTE.chain(createNodes))),
  RTE.map(constVoid),
)

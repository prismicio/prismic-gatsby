import * as RTE from 'fp-ts/ReaderTaskEither'
import * as A from 'fp-ts/Array'
import { pipe, flow, constVoid } from 'fp-ts/function'

import { Dependencies, PrismicDocument } from './types'

export const createNode = (
  doc: PrismicDocument,
): RTE.ReaderTaskEither<Dependencies, never, void> =>
  pipe(
    RTE.ask<Dependencies>(),
    RTE.map((deps) =>
      pipe(
        doc,
        deps.nodeHelpers.createNodeFactory(doc.type),
        deps.gatsbyCreateNode,
      ),
    ),
  )

export const createNodes = flow(
  A.map(createNode),
  A.sequence(RTE.readerTaskEither),
  RTE.map(constVoid),
)

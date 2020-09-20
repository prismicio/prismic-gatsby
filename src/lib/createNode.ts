import * as RTE from 'fp-ts/ReaderTaskEither'
import { pipe } from 'fp-ts/function'

import { Dependencies } from '../types'
import { IdentifiableRecord } from './nodeHelpers'

export const createNode = (
  record: IdentifiableRecord,
): RTE.ReaderTaskEither<Dependencies, never, void> =>
  pipe(
    RTE.ask<Dependencies>(),
    RTE.map((deps) =>
      pipe(
        record,
        deps.nodeHelpers.createNodeFactory(record.type),
        deps.gatsbyCreateNode,
      ),
    ),
  )

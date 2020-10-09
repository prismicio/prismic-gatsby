import * as RTE from 'fp-ts/ReaderTaskEither'
import { pipe } from 'fp-ts/function'

import { Dependencies } from '../types'
import { IdentifiableRecord } from './nodeHelpers'

/**
 * Creates a node using the environment's `createNode` function. The provided
 * record is passed through a node helper factory based on the record's `type`
 * field.
 *
 * @param record Record with an `id` and `type` field with which to create a
 * node.
 */
export const createNode = (
  record: IdentifiableRecord,
): RTE.ReaderTaskEither<Dependencies, never, void> =>
  RTE.asks((deps) =>
    pipe(
      record,
      deps.nodeHelpers.createNodeFactory(record.type),
      deps.createNode,
    ),
  )

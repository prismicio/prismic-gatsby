import * as gatsby from 'gatsby'
import * as RTE from 'fp-ts/ReaderTaskEither'
import * as I from 'fp-ts/Identity'
import { pipe } from 'fp-ts/function'
import { IdentifiableRecord } from 'gatsby-node-helpers'

import { Dependencies } from '../types'

export interface IdentifiableRecordWithType extends IdentifiableRecord {
  type: string
}

/**
 * Creates a node using the environment's `createNode` function. The provided
 * record is passed through a node helper factory based on the record's `type`
 * field.
 *
 * @param record Record with an `id` and `type` field with which to create a
 * node.
 */
export const createNode = (
  record: IdentifiableRecordWithType,
): RTE.ReaderTaskEither<Dependencies, never, gatsby.NodeInput> =>
  RTE.asks((deps) =>
    pipe(
      record,
      deps.nodeHelpers.createNodeFactory(record.type),
      I.chainFirst(deps.createNode),
    ),
  )

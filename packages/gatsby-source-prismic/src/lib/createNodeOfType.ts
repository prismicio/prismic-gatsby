import * as gatsby from 'gatsby'
import * as RTE from 'fp-ts/ReaderTaskEither'
import * as I from 'fp-ts/Identity'
import { pipe } from 'fp-ts/function'
import { IdentifiableRecord } from 'gatsby-node-helpers'

import { Dependencies } from '../types'

/**
 * Creates a node using the environment's `createNode` function. The provided record is passed through a node helper factory based on the record's `type` field.
 *
 * @param record Record with an `id` field with which to create a node.
 * @param type Type of the record.
 */
export function createNodeOfType(
  record: IdentifiableRecord,
  type: string,
): RTE.ReaderTaskEither<Dependencies, never, gatsby.NodeInput> {
  return RTE.asks((deps) =>
    pipe(
      record,
      deps.nodeHelpers.createNodeFactory(type),
      I.chainFirst(deps.createNode),
    ),
  )
}

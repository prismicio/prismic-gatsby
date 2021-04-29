import * as gatsby from 'gatsby'
import * as RTE from 'fp-ts/ReaderTaskEither'
import * as I from 'fp-ts/Identity'
import { pipe } from 'fp-ts/function'
import { IdentifiableRecord } from 'gatsby-node-helpers'

import { Dependencies } from '../types'

/**
 * Creates a node using the environment's `createNode` function.
 *
 * By using this function, the record's `id` field must be globally unique. If
 * the record's ID may conflict with another's within the application's scope,
 * even if it is of a different type, use the standard `createNodeOfType`
 * function instead.
 *
 * @param record Record with an `id` field with which to create a node.
 * @param type Type of the record.
 */
export const createGloballyUniqueNodeOfType = (
  record: IdentifiableRecord,
  type: string | string[],
): RTE.ReaderTaskEither<Dependencies, never, gatsby.NodeInput> =>
  RTE.asks((deps) =>
    pipe(
      record,
      deps.nodeHelpers.createNodeFactory(type, { idIsGloballyUnique: true }),
      I.chainFirst(deps.createNode),
    ),
  )

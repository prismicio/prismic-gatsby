import * as gatsby from 'gatsby'
import * as RTE from 'fp-ts/ReaderTaskEither'
import { IdentifiableRecord } from 'gatsby-node-helpers'

import { Dependencies } from '../types'

import { createGloballyUniqueNodeOfType } from './createGloballyUniqueNodeOfType'

export interface IdentifiableRecordWithType extends IdentifiableRecord {
  type: string
}

/**
 * Creates a node using the environment's `createNode` function. The provided
 * record is passed through a node helper factory based on the record's `type`
 * field.
 *
 * By using this function, the record's `id` field must be globally unique. If
 * the record's ID may conflict with another's within the application's scope,
 * even if it is of a different type, use the standard `createNode` function
 * instead.
 *
 * @see `lib/createNode.ts`
 *
 * @param record Record with an `id` and `type` field with which to create a node.
 */
export const createGloballyUniqueNode = (
  record: IdentifiableRecordWithType,
): RTE.ReaderTaskEither<Dependencies, never, gatsby.NodeInput> =>
  createGloballyUniqueNodeOfType(record, record.type)

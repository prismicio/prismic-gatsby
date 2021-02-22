import * as RTE from 'fp-ts/ReaderTaskEither'
import * as A from 'fp-ts/Array'
import { flow } from 'fp-ts/function'

import { createGloballyUniqueNode } from './createGloballyUniqueNode'

/**
 * Creates one or more globally unique nodes.
 *
 * By using this function, the records' `id` fields must be globally unique. If a record's ID may conflict with another's within the application's scope, even if it is of a different type, use the standard `createNodes` function instead.
 *
 * @see lib/createGloballyUniqueNode.ts
 */
export const createGloballyUniqueNodes = flow(
  A.map(createGloballyUniqueNode),
  A.sequence(RTE.readerTaskEither),
)

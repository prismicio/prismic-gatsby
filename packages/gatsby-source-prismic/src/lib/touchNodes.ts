import * as RTE from 'fp-ts/ReaderTaskEither'
import * as A from 'fp-ts/Array'
import { flow } from 'fp-ts/function'

import { touchNode } from './touchNode'

/**
 * Touches one or more nodes.
 *
 * @see gatsby-source-prismic/lib/touchNode.ts
 */
export const touchNodes = flow(A.map(touchNode), RTE.sequenceArray)

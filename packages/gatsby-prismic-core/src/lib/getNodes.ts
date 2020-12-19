import * as RTE from 'fp-ts/ReaderTaskEither'
import * as A from 'fp-ts/Array'
import { flow } from 'fp-ts/function'

import { getNode } from './getNode'

/**
 * Returns one or more nodes.
 *
 * @see gatsby-source-prismic/lib/getNode.ts
 */
export const getNodes = flow(A.map(getNode), A.sequence(RTE.readerTaskEither))

import * as RTE from 'fp-ts/ReaderTaskEither'
import * as A from 'fp-ts/Array'
import { Dependencies } from 'gatsby-prismic-core'
import { pipe, constVoid } from 'fp-ts/function'

import { getAllNodes } from './getAllNodes'
import { touchNodes } from './touchNodes'

/**
 * Touches all nodes.
 */
export const touchAllNodes = (): RTE.ReaderTaskEither<
  Dependencies,
  never,
  void
> =>
  pipe(
    getAllNodes(),
    RTE.map(A.map((node) => node.id)),
    RTE.chain(touchNodes),
    RTE.map(constVoid),
  )

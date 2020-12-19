import * as RTE from 'fp-ts/ReaderTaskEither'
import * as A from 'fp-ts/Array'
import { pipe, constVoid } from 'fp-ts/function'

import { Dependencies } from '../types'

import { getAllNodes } from './getAllNodes'
import { touchNodes } from './touchNodes'

/**
 * Touches all nodes using the environment's `getAllNodes` and `touchNodes`
 * functions.
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

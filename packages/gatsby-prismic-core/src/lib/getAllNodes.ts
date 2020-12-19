import * as gatsby from 'gatsby'
import * as RTE from 'fp-ts/ReaderTaskEither'

import { Dependencies } from '../types'

/**
 * Returns all nodes using the environment's `getNodes` function.
 */
export const getAllNodes = (): RTE.ReaderTaskEither<
  Dependencies,
  never,
  gatsby.Node[]
> => RTE.asks((deps) => deps.getNodes())

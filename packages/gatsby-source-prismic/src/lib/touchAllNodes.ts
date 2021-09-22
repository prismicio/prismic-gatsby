import * as RTE from 'fp-ts/ReaderTaskEither'
import * as A from 'fp-ts/Array'
import { pipe, constVoid } from 'fp-ts/function'

import { Dependencies, PrismicAPIDocumentNode } from '../types'

import { getAllNodes } from './getAllNodes'
import { touchNodes } from './touchNodes'
import { PLUGIN_NAME } from '../constants'

type TouchAllNodesConfig = {
  exceptPrismicIds: string[]
}

/**
 * Touches all gatsby-source-prismic nodes using the environment's `getAllNodes`
 * and `touchNodes` functions.
 */
export const touchAllNodes = (
  config: TouchAllNodesConfig = { exceptPrismicIds: [] },
): RTE.ReaderTaskEither<Dependencies, never, void> =>
  pipe(
    getAllNodes(),
    RTE.map(
      A.filter(
        (node): node is PrismicAPIDocumentNode =>
          node.internal.owner === PLUGIN_NAME,
      ),
    ),
    RTE.map(
      A.filter((node) => !config.exceptPrismicIds.includes(node.prismicId)),
    ),
    RTE.chain(touchNodes),
    RTE.map(constVoid),
  )

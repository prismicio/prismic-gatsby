import * as R from 'fp-ts/Record'
import { pipe } from 'fp-ts/function'

import { PrismicAPIDocumentNodeInput } from '../types'
import { PrismicContextState } from '../context'

/**
 * Returns nodes from the node store with URLs that match the given path.
 *
 * @param path Path to match document URLs against.
 * @param nodesStore Node store containing Prismic document nodes to search.
 *
 * @returns A list of Prismic nodes whose URLs match the given path.
 */
export const getNodesForPath = (
  path: string,
  nodesStore: PrismicContextState['nodes'],
): PrismicAPIDocumentNodeInput[] =>
  pipe(
    nodesStore,
    R.filter((node) => node.url === path),
    R.collect((_, node) => node),
  )

import * as A from 'fp-ts/Array'
import { pipe } from 'fp-ts/function'
import * as gatsbyPrismic from 'gatsby-source-prismic'

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
  runtime: gatsbyPrismic.Runtime,
): gatsbyPrismic.NormalizedDocumentValue[] =>
  pipe(
    runtime.nodes,
    A.filter((node) => node.url === path),
  )

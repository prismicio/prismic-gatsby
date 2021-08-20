import * as gatsbyPrismic from 'gatsby-source-prismic'
import * as A from 'fp-ts/Array'
import { pipe } from 'fp-ts/function'

export const serializeTypePathNodes = (
  typePathNodes: gatsbyPrismic.TypePathNode[],
): string =>
  pipe(
    typePathNodes,
    A.map((node) => ({
      kind: node.kind,
      path: node.path,
      type: node.type,
    })),
    JSON.stringify,
  )

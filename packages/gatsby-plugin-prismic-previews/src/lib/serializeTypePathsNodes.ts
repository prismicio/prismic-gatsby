import * as gatsbyPrismic from 'gatsby-source-prismic'
import * as R from 'fp-ts/Record'
import * as S from 'fp-ts/Semigroup'
import * as A from 'fp-ts/Array'
import { pipe } from 'fp-ts/function'

import { serializePath } from './serializePath'

export const serializeTypePathNodes = (
  typePathNodes: gatsbyPrismic.TypePathNode[],
): string =>
  pipe(
    R.fromFoldableMap(S.last<string>(), A.Foldable)(typePathNodes, (node) => [
      serializePath(node.path),
      node.type,
    ]),
    JSON.stringify,
  )

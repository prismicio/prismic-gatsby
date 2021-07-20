import * as gatsby from 'gatsby'
import * as RTE from 'fp-ts/ReaderTaskEither'
import { pipe } from 'fp-ts/function'

import { buildNamedInferredNodeType } from '../lib/buildNamedInferredNodeType'

import { Dependencies } from '../types'

/**
 * Builds a GraphQL type used by Embed fields. The resulting type can be
 * created using Gatsby's `createTypes` action.
 */
// TODO: Move typename to Dependencies (create in `buildDependencies.ts`).
export const buildEmbedType: RTE.ReaderTaskEither<
  Dependencies,
  never,
  gatsby.GatsbyGraphQLType
> = pipe(
  RTE.asks((deps: Dependencies) =>
    deps.nodeHelpers.createTypeName('EmbedType'),
  ),
  RTE.chain(buildNamedInferredNodeType),
)

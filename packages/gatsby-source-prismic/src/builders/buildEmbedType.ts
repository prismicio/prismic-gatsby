import * as gatsby from 'gatsby'
import * as RTE from 'fp-ts/ReaderTaskEither'
import { pipe } from 'fp-ts/function'

import { buildNamedInferredNodeType } from '../lib/buildNamedInferredNodeType'

import { Dependencies } from '../types'

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

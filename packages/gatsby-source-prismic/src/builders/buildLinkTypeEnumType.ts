import * as gatsby from 'gatsby'
import * as RTE from 'fp-ts/ReaderTaskEither'
import { pipe } from 'fp-ts/function'

import { Dependencies } from '../types'
import { buildEnumType } from '../lib/buildEnumType'

export const buildLinkTypeEnumType: RTE.ReaderTaskEither<
  Dependencies,
  never,
  gatsby.GatsbyGraphQLType
> = pipe(
  RTE.ask<Dependencies>(),
  RTE.chain((deps) =>
    buildEnumType({
      name: deps.globalNodeHelpers.createTypeName('LinkType'),
      values: { Any: {}, Document: {}, Media: {}, Web: {} },
    }),
  ),
)

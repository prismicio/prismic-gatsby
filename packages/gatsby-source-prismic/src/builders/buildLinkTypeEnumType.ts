import * as gatsby from 'gatsby'
import * as RTE from 'fp-ts/ReaderTaskEither'
import { pipe } from 'fp-ts/function'

import { Dependencies } from '../types'
import { buildEnumType } from '../lib/buildEnumType'

/**
 * Builds a GraphQL type used by a Link field's `type` field. The resulting type
 * can be created using Gatsby's `createTypes` action.
 */
// TODO: Move typename to Dependencies (create in `buildDependencies.ts`).
export const buildLinkTypeEnumType: RTE.ReaderTaskEither<
  Dependencies,
  never,
  gatsby.GatsbyGraphQLType
> = pipe(
  RTE.ask<Dependencies>(),
  RTE.chain((deps) =>
    buildEnumType({
      name: deps.globalNodeHelpers.createTypeName('LinkTypeEnum'),
      values: { Any: {}, Document: {}, Media: {}, Web: {} },
    }),
  ),
)

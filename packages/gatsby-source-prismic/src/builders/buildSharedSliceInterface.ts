import * as gatsby from 'gatsby'
import * as RTE from 'fp-ts/ReaderTaskEither'
import { pipe } from 'fp-ts/function'

import { Dependencies } from '../types'
import { buildInterfaceType } from '../lib/buildInterfaceType'

/**
 * Builds a GraphQL Interface type for Shared Slice fields. It includes
 * fields common to all Shared Slices. The resulting type can be
 * created using Gatsby's `createTypes` action.
 */
// TODO: Move typename to Dependencies (create in `buildDependencies.ts`).
export const buildSharedSliceInterface: RTE.ReaderTaskEither<
  Dependencies,
  never,
  gatsby.GatsbyGraphQLType
> = pipe(
  RTE.ask<Dependencies>(),
  RTE.chain((deps) =>
    buildInterfaceType({
      name: deps.globalNodeHelpers.createTypeName('SharedSliceType'),
      fields: {
        id: 'ID!',
        slice_type: 'String!',
        slice_label: 'String',
        version: 'String!',
        variation: 'String!',
      },
    }),
  ),
)

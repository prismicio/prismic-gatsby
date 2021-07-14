import * as gatsby from 'gatsby'
import * as RTE from 'fp-ts/ReaderTaskEither'
import { pipe } from 'fp-ts/function'

import { Dependencies } from '../types'
import { buildObjectType } from '../lib/buildObjectType'

/**
 * Builds a GraphQL type used to map a Custom Type's fields to an Prismic field
 * type enum value. The resulting type can be created using Gatsby's
 * `createTypes` action.
 */
export const buildTypePathType: RTE.ReaderTaskEither<
  Dependencies,
  never,
  gatsby.GatsbyGraphQLType
> = pipe(
  RTE.ask<Dependencies>(),
  RTE.chain((deps) =>
    buildObjectType({
      name: deps.nodeHelpers.createTypeName('TypePathType'),
      fields: {
        kind: 'String!',
        path: '[String!]!',
        type: 'String!',
      },
      interfaces: ['Node'],
      extensions: { infer: false },
    }),
  ),
)

import * as gatsby from 'gatsby'
import * as RTE from 'fp-ts/ReaderTaskEither'
import { pipe } from 'fp-ts/function'

import { Dependencies } from '../types'
import { buildObjectType } from './buildObjectType'

/**
 * Builds a GraphQL object type using Gatsby's Node interface with field
 * inference enabled using the environment's `buildObjectType` function. The
 * type name is generated using the environment's node helpers and the `path`
 * parameter.
 *
 * @param path List of field names from the root object to the field to which
 * the inferred node type will be assigned. Determines the type's name.
 *
 * @returns Return type of the envionrment's `buildObjectType` function.
 */
export const buildInferredNodeType = (
  path: string[],
): RTE.ReaderTaskEither<Dependencies, never, gatsby.GatsbyGraphQLObjectType> =>
  pipe(
    RTE.ask<Dependencies>(),
    RTE.chain((deps) =>
      buildObjectType({
        name: deps.nodeHelpers.createTypeName(...path),
        interfaces: ['Node'],
        extensions: { infer: true },
      }),
    ),
  )

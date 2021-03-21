import * as gatsby from 'gatsby'
import * as gqlc from 'graphql-compose'
import * as RTE from 'fp-ts/ReaderTaskEither'

import { Dependencies } from '../types'

/**
 * Builds a GraphQL union type using the environment's `buildUnionType`
 * function.
 *
 * @param config Configuration for the union type.
 *
 * @return Return value of the environment's `buildUnionType` function.
 */
export const buildUnionType = <TSource, TContext>(
  config: gqlc.UnionTypeComposerAsObjectDefinition<TSource, TContext>,
): RTE.ReaderTaskEither<Dependencies, never, gatsby.GatsbyGraphQLUnionType> =>
  RTE.asks((deps) => deps.buildUnionType(config))

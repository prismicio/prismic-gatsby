import * as gatsby from 'gatsby'
import * as gqlc from 'graphql-compose'
import * as RTE from 'fp-ts/ReaderTaskEither'

import { Dependencies } from '../types'

/**
 * Builds a GraphQL object type using the environment's `buildObjectType`
 * function.
 *
 * @param config Configuration for the object type.
 *
 * @return Return value of the environment's `buildObjectType` function.
 */
export const buildObjectType = <TSource, TContext>(
  config: gqlc.ComposeObjectTypeConfig<TSource, TContext>,
): RTE.ReaderTaskEither<Dependencies, never, gatsby.GatsbyGraphQLObjectType> =>
  RTE.asks((deps) => deps.buildObjectType(config))

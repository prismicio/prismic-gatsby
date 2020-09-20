import * as gatsby from 'gatsby'
import * as gqlc from 'graphql-compose'
import * as RTE from 'fp-ts/ReaderTaskEither'

import { Dependencies } from '../types'

export const buildUnionType = <TSource, TContext>(
  config: gqlc.ComposeUnionTypeConfig<TSource, TContext>,
): RTE.ReaderTaskEither<Dependencies, never, gatsby.GatsbyGraphQLUnionType> =>
  RTE.asks((deps) => deps.buildUnionType(config))

import * as gatsby from 'gatsby'
import * as gqlc from 'graphql-compose'
import * as RTE from 'fp-ts/ReaderTaskEither'

import { Dependencies } from '../types'

export const buildEnumType = (
  config: gqlc.ComposeEnumTypeConfig,
): RTE.ReaderTaskEither<Dependencies, never, gatsby.GatsbyGraphQLEnumType> =>
  RTE.asks((deps) => deps.buildEnumType(config))

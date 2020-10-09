import * as gatsby from 'gatsby'
import * as RTE from 'fp-ts/ReaderTaskEither'

import { Dependencies } from '../types'

export const registerType = <A extends gatsby.GatsbyGraphQLType>(
  types: A,
): RTE.ReaderTaskEither<Dependencies, never, void> =>
  RTE.asks((deps) => deps.createTypes(types))

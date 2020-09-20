import * as gatsby from 'gatsby'
import * as RTE from 'fp-ts/ReaderTaskEither'
import { pipe } from 'fp-ts/function'

import { Dependencies } from '../types'

export const registerTypes = <A extends gatsby.GatsbyGraphQLType[]>(
  types: A,
): RTE.ReaderTaskEither<Dependencies, never, void> =>
  pipe(
    RTE.ask<Dependencies>(),
    RTE.map((deps) => deps.gatsbyCreateTypes(types)),
  )

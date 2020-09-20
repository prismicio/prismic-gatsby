import * as gatsby from 'gatsby'
import * as RTE from 'fp-ts/ReaderTaskEither'
import { pipe } from 'fp-ts/function'

import { Dependencies } from '../types'

export const buildNamedInferredNodeType = (
  name: string,
): RTE.ReaderTaskEither<Dependencies, never, gatsby.GatsbyGraphQLObjectType> =>
  pipe(
    RTE.ask<Dependencies>(),
    RTE.map((deps) =>
      deps.gatsbyBuildObjectType({
        name,
        interfaces: ['Node'],
        extensions: { infer: true },
      }),
    ),
  )

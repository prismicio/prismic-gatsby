import * as gatsby from 'gatsby'
import * as RTE from 'fp-ts/ReaderTaskEither'
import { pipe } from 'fp-ts/function'

import { Dependencies } from '../types'
import { buildObjectType } from './buildObjectType'

export const buildInferredNodeType = (
  path: string[],
): RTE.ReaderTaskEither<Dependencies, never, gatsby.GatsbyGraphQLObjectType> =>
  pipe(
    RTE.ask<Dependencies>(),
    RTE.chain((deps) =>
      buildObjectType({
        name: deps.nodeHelpers.generateTypeName(...path),
        interfaces: ['Node'],
        extensions: { infer: true },
      }),
    ),
  )

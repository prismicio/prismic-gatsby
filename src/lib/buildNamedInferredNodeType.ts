import * as gatsby from 'gatsby'
import * as RTE from 'fp-ts/ReaderTaskEither'

import { Dependencies } from '../types'
import { buildObjectType } from './buildObjectType'

export const buildNamedInferredNodeType = (
  name: string,
): RTE.ReaderTaskEither<Dependencies, never, gatsby.GatsbyGraphQLObjectType> =>
  buildObjectType({
    name,
    interfaces: ['Node'],
    extensions: { infer: true },
  })

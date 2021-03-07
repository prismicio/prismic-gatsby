import * as gatsby from 'gatsby'
import * as RTE from 'fp-ts/ReaderTaskEither'
import { pipe } from 'fp-ts/function'

import { Dependencies } from '../types'
import { buildInterfaceType } from '../lib/buildInterfaceType'

export const buildSliceInterface: RTE.ReaderTaskEither<
  Dependencies,
  never,
  gatsby.GatsbyGraphQLType
> = pipe(
  RTE.ask<Dependencies>(),
  RTE.chain((deps) =>
    buildInterfaceType({
      name: deps.globalNodeHelpers.createTypeName('SliceType'),
      fields: {
        id: 'ID!',
        slice_type: 'String!',
        slice_label: 'String',
      },
    }),
  ),
)

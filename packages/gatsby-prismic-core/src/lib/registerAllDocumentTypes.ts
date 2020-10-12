import * as gatsby from 'gatsby'
import * as RTE from 'fp-ts/ReaderTaskEither'
import * as A from 'fp-ts/Array'
import { pipe } from 'fp-ts/function'

import { Dependencies } from '../types'
import { getTypeName } from './getTypeName'
import { buildUnionType } from './buildUnionType'
import { registerType } from './registerType'

export const registerAllDocumentTypes = (
  types: gatsby.GatsbyGraphQLObjectType[],
): RTE.ReaderTaskEither<Dependencies, never, gatsby.GatsbyGraphQLUnionType> =>
  pipe(
    RTE.ask<Dependencies>(),
    RTE.chain((deps) =>
      pipe(
        types,
        A.map(getTypeName),
        (types) =>
          buildUnionType({
            name: deps.nodeHelpers.createTypeName('AllDocumentTypes'),
            types,
          }),
        RTE.chainFirst(registerType),
      ),
    ),
  )

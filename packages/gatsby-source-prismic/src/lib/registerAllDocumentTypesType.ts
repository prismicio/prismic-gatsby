import * as gatsby from 'gatsby'
import * as RTE from 'fp-ts/ReaderTaskEither'
import * as A from 'fp-ts/Array'
import { pipe } from 'fp-ts/function'

import { Dependencies } from '../types'
import { getTypeName } from './getTypeName'
import { buildUnionType } from './buildUnionType'
import { createType } from './createType'

/**
 * Registers the `AllDocumentTypes` GraphQL union type containing all provided
 * document types.
 *
 * @param types List of document types to include in the created union type.
 *
 * @returns The registered `AllDocumentTypes` type.
 */
export const registerAllDocumentTypesType = (
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
        RTE.chainFirst(createType),
      ),
    ),
  )

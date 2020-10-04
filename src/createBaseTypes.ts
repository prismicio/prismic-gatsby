import * as gatsby from 'gatsby'
import * as RTE from 'fp-ts/ReaderTaskEither'
import * as A from 'fp-ts/Array'
import { pipe, constVoid } from 'fp-ts/function'

import { Dependencies } from './types'
import { buildEnumType } from './lib/buildEnumType'
import { registerType } from './lib/registerType'

const createLinkTypes = (): RTE.ReaderTaskEither<
  Dependencies,
  never,
  gatsby.GatsbyGraphQLEnumType
> =>
  pipe(
    RTE.ask<Dependencies>(),
    RTE.chain((deps) =>
      buildEnumType({
        name: deps.globalNodeHelpers.createTypeName('LinkTypes'),
        values: { Any: {}, Document: {}, Media: {}, Web: {} },
      }),
    ),
    RTE.chainFirst(registerType),
  )

export const createBaseTypes = (): RTE.ReaderTaskEither<
  Dependencies,
  never,
  void
> =>
  pipe(
    [createLinkTypes()],
    A.sequence(RTE.readerTaskEither),
    RTE.map(constVoid),
  )

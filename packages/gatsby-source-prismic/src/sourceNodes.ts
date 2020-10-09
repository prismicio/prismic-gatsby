import * as RTE from 'fp-ts/ReaderTaskEither'
import { pipe, flow } from 'fp-ts/function'

import { Dependencies } from 'shared/types'
import { registerCustomTypes } from 'shared/registerCustomTypes'
import { queryAllDocuments } from 'shared/lib/client'
import { createNodes } from 'shared/lib/createNodes'
import { registerAllDocumentTypes } from 'shared/lib/registerAllDocumentTypes'
import { createBaseTypes } from 'shared/createBaseTypes'

export const sourceNodes: RTE.ReaderTaskEither<
  Dependencies,
  never,
  void
> = pipe(
  RTE.ask<Dependencies>(),
  RTE.chainFirst(createBaseTypes),
  RTE.chainFirst(
    flow(registerCustomTypes, RTE.chain(registerAllDocumentTypes)),
  ),
  RTE.chain(flow(queryAllDocuments, RTE.chain(createNodes))),
)

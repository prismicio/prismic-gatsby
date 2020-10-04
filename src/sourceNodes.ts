import * as RTE from 'fp-ts/ReaderTaskEither'
import { pipe, flow } from 'fp-ts/function'

import { Dependencies } from './types'
import { registerCustomTypes } from './registerCustomTypes'
import { queryAllDocuments } from './lib/client'
import { createNodes } from './lib/createNodes'
import { registerAllDocumentTypes } from './lib/registerAllDocumentTypes'
import { createBaseTypes } from './createBaseTypes'

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

import * as RTE from 'fp-ts/ReaderTaskEither'
import { pipe, flow } from 'fp-ts/function'

import { Dependencies } from './types'
import { registerAllDocumentTypes, registerCustomTypes } from './registerTypes'
import { queryAllDocuments } from './client'
import { createNodes } from './createNode'

export const sourceNodes: RTE.ReaderTaskEither<
  Dependencies,
  never,
  void
> = pipe(
  RTE.ask<Dependencies>(),
  // RTE.bind('pluginOptions', (deps) =>
  //   RTE.fromEither(PluginOptionsD.decode(deps.unvalidatedPluginOptions)),
  // ),
  RTE.chainFirst(
    flow(registerCustomTypes, RTE.chain(registerAllDocumentTypes)),
  ),
  RTE.chain(flow(queryAllDocuments, RTE.chain(createNodes))),
)

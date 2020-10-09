import * as React from 'react'
import * as RTE from 'fp-ts/ReaderTaskEither'
import { pipe, flow, constVoid } from 'fp-ts/function'

import { Dependencies } from 'shared/types'
import { registerCustomTypes } from 'shared/registerCustomTypes'
import { queryAllDocuments } from 'shared/lib/client'
import { createNodes } from 'shared/lib/createNodes'
import { registerAllDocumentTypes } from 'shared/lib/registerAllDocumentTypes'
import { createBaseTypes } from 'shared/createBaseTypes'

import { usePrismicContext } from './context'
import { buildDependencies } from './buildDependencies'

const prismicPreviewProgram: RTE.ReaderTaskEither<
  Dependencies,
  never,
  void
> = pipe(
  RTE.ask<Dependencies>(),
  RTE.chainFirst(createBaseTypes),
  RTE.chainFirst(
    flow(registerCustomTypes, RTE.chain(registerAllDocumentTypes)),
  ),
  RTE.map(constVoid),
)

export const usePrismicPreview = (repositoryName: string) => {
  const [state, dispatch] = usePrismicContext()
  const pluginOptions = state.pluginOptionsMap[repositoryName]
  if (!pluginOptions)
    throw Error(
      `usePrismicPreview was configured to use a repository with the name "${repositoryName}" but was not registered in the top-level PrismicProvider component. Please check your repository name and/or PrismicProvider props.`,
    )

  return RTE.run(
    prismicPreviewProgram,
    buildDependencies(dispatch, pluginOptions),
  )
}

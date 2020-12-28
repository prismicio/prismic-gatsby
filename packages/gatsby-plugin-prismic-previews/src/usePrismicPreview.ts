import * as React from 'react'
import * as RTE from 'fp-ts/ReaderTaskEither'
import { pipe, constVoid } from 'fp-ts/function'
import Prismic from 'prismic-javascript'
import { Dependencies } from 'gatsby-source-prismic/dist/types'
import { registerCustomTypes } from 'gatsby-source-prismic/dist/lib/registerCustomTypes'
import { createBaseTypes } from 'gatsby-source-prismic/dist/lib/createBaseTypes'
import { registerAllDocumentTypesType } from 'gatsby-source-prismic/dist/lib/registerAllDocumentTypesType'
import { sourceNodesForAllDocuments } from 'gatsby-source-prismic/dist/lib/sourceNodesForAllDocuments'
import { getCookieSafely } from 'gatsby-source-prismic/dist/lib/getCookieSafely'

import {
  PrismicContextAction,
  PrismicContextActionType,
  usePrismicContext,
} from './usePrismicContext'
import { buildDependencies } from './buildDependencies'

enum ActionType {
  IsLoading = 'IsLoading',
  IsLoaded = 'IsLoaded',
}

type Action = {
  type: ActionType
}

interface State {
  isLoading: boolean
}

const initialState = {
  isLoading: false,
}

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case ActionType.IsLoading: {
      return {
        ...state,
        isLoading: true,
      }
    }

    case ActionType.IsLoaded: {
      return {
        ...state,
        isLoading: false,
      }
    }
  }
}

interface PrismicPreviewProgramDependencies {
  isBootstrapped: boolean
  dispatch: (action: Action) => void
  contextDispatch: (action: PrismicContextAction) => void
}

const declareLoading = (): RTE.ReaderTaskEither<
  PrismicPreviewProgramDependencies & Dependencies,
  never,
  void
> =>
  RTE.asks((deps) =>
    deps.dispatch({
      type: ActionType.IsLoading,
    }),
  )

const declareLoaded = (): RTE.ReaderTaskEither<
  PrismicPreviewProgramDependencies & Dependencies,
  never,
  void
> =>
  RTE.asks((deps) =>
    deps.dispatch({
      type: ActionType.IsLoaded,
    }),
  )

const declareBootstrapped = (): RTE.ReaderTaskEither<
  PrismicPreviewProgramDependencies & Dependencies,
  never,
  void
> =>
  RTE.asks((deps) =>
    deps.contextDispatch({
      type: PrismicContextActionType.IsBootstrapped,
      payload: { repositoryName: deps.pluginOptions.repositoryName },
    }),
  )

const prismicPreviewProgram: RTE.ReaderTaskEither<
  PrismicPreviewProgramDependencies & Dependencies,
  void,
  void
> = pipe(
  RTE.ask<PrismicPreviewProgramDependencies & Dependencies>(),

  // Only continue if this is a preview session, which is determined by the
  // presence of the Prismic preview cookie.
  RTE.chainW(
    RTE.fromPredicate(
      () => Boolean(getCookieSafely(Prismic.previewCookie)),
      constVoid,
    ),
  ),

  // Only bootstrap once.
  RTE.chainW(RTE.fromPredicate((deps) => !deps.isBootstrapped, constVoid)),

  // Begin loading state.
  RTE.chainW(declareLoading),

  // Same process as gatsby-node's createSchemaCustomization.
  // @see gatsby-source-prismic/src/create-schema-customization.ts
  RTE.chainW(createBaseTypes),
  RTE.bindW('types', registerCustomTypes),
  RTE.chainW((scope) => registerAllDocumentTypesType(scope.types)),

  // Same process as gatsby-node's sourceNodes.
  // @see gatsby-source-prismic/src/source-nodes.ts
  RTE.chainW(sourceNodesForAllDocuments),

  // End loading state.
  RTE.chainW(declareBootstrapped),
  RTE.chainW(declareLoaded),

  RTE.map(constVoid),
)

export type UsePrismicPreviewConfig = {
  repositoryName: string
}

export const usePrismicPreview = (config: UsePrismicPreviewConfig): State => {
  const [state, dispatch] = React.useReducer(reducer, initialState)
  const [contextState, contextDispatch] = usePrismicContext()

  React.useEffect(() => {
    const pluginOptions = contextState.pluginOptionsMap[config.repositoryName]
    if (!pluginOptions) {
      throw Error(
        `usePrismicPreview was configured to use a repository with the name "${config.repositoryName}" but was not registered in the top-level PrismicProvider component. Please check your repository name and/or PrismicProvider props.`,
      )
    }

    const dependencies = {
      ...buildDependencies(contextState, contextDispatch, pluginOptions),
      isBootstrapped:
        contextState.isBootstrappedMap[pluginOptions.repositoryName],
      dispatch,
      contextDispatch,
    }

    RTE.run(prismicPreviewProgram, dependencies)
  }, [contextState, contextDispatch, config.repositoryName])

  return state
}

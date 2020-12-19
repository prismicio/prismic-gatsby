import * as React from 'react'
import * as gatsby from 'gatsby'
import * as cookie from 'es-cookie'
import * as RTE from 'fp-ts/ReaderTaskEither'
import { pipe } from 'fp-ts/function'
import Prismic from 'prismic-javascript'
import {
  createClient,
  Dependencies,
  PrismicDocument,
  queryById,
} from 'gatsby-prismic-core'

import { getURLSearchParam } from './lib/getURLSearchParam'
import { buildDependencies } from './buildDependencies'
import {
  PrismicContextAction,
  PrismicContextActionType,
  usePrismicContext,
} from './usePrismicContext'

enum ActionType {
  DocumentLoaded = 'DocumentLoaded',
}

type Action = {
  type: ActionType.DocumentLoaded
  payload: { path: string; document: PrismicDocument }
}

interface State {
  isLoading: boolean
  document?: PrismicDocument
  path?: string
}

const initialState = {
  isLoading: false,
  document: undefined,
  path: undefined,
}

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case ActionType.DocumentLoaded: {
      return {
        ...state,
        isLoading: false,
        document: action.payload.document,
        path: action.payload.path,
      }
    }
  }
}

interface PrismicPreviewProgramDependencies {
  shouldAutoRedirect: boolean
  dispatch: (action: Action) => void
  contextDispatch: (action: PrismicContextAction) => void
}

const documentLoaded = (
  path: string,
  document: PrismicDocument,
): RTE.ReaderTaskEither<PrismicPreviewProgramDependencies, never, void> =>
  RTE.asks((deps) =>
    deps.dispatch({
      type: ActionType.DocumentLoaded,
      payload: { path, document },
    }),
  )

const createRootNodeRelationship = (
  path: string,
  nodeId: string,
): RTE.ReaderTaskEither<PrismicPreviewProgramDependencies, never, void> =>
  RTE.asks((deps) =>
    deps.contextDispatch({
      type: PrismicContextActionType.CreateRootNodeRelationship,
      payload: { path, nodeId },
    }),
  )

const prismicPreviewResolverProgram = pipe(
  RTE.ask<PrismicPreviewProgramDependencies & Dependencies>(),
  RTE.bindW('previewRef', () =>
    pipe(
      getURLSearchParam('token'),
      RTE.fromOption(() => Error('token URL parameter not present')),
    ),
  ),
  RTE.chainFirst((scope) =>
    RTE.of(cookie.set(Prismic.previewCookie, scope.previewRef)),
  ),
  RTE.bindW('documentId', () =>
    pipe(
      getURLSearchParam('documentId'),
      RTE.fromOption(() => Error('documentId URL parameter not present')),
    ),
  ),
  RTE.bindW('client', createClient),
  RTE.bindW('document', (scope) =>
    pipe(
      queryById(scope.client, scope.documentId, {
        fetchLinks: scope.pluginOptions.fetchLinks,
        lang: scope.pluginOptions.lang,
      }),
      RTE.fromTask,
    ),
  ),
  RTE.bindW('path', (scope) =>
    pipe(
      scope.pluginOptions.linkResolver?.()?.(scope.document),
      RTE.fromPredicate(
        (path) => path != null,
        () =>
          Error(
            'linkResolver did not resolve to a path for the previewed document',
          ),
      ),
    ),
  ),
  RTE.chainFirstW((scope) =>
    createRootNodeRelationship(scope.path, scope.document.id),
  ),
  RTE.chainFirstW((scope) => documentLoaded(scope.path, scope.document)),
  // TODO: Replace this map with something more side-effect-y
  RTE.map((scope) => {
    if (scope.shouldAutoRedirect) gatsby.navigate(scope.path)
  }),
)

export type UsePrismicPreviewResolverConfig = {
  repositoryName: string
  shouldAutoRedirect?: boolean
}

export const usePrismicPreviewResolver = (
  config: UsePrismicPreviewResolverConfig,
): State => {
  const [state, dispatch] = React.useReducer(reducer, initialState)
  const [contextState, contextDispatch] = usePrismicContext()

  React.useEffect(() => {
    const pluginOptions = contextState.pluginOptionsMap[config.repositoryName]
    if (!pluginOptions)
      throw Error(
        `usePrismicPreviewResolver was configured to use a repository with the name "${config.repositoryName}" but was not registered in the top-level PrismicProvider component. Please check your repository name and/or PrismicProvider props.`,
      )

    const dependencies = {
      ...buildDependencies(contextState, contextDispatch, pluginOptions),
      shouldAutoRedirect: config.shouldAutoRedirect ?? true,
      dispatch,
      contextDispatch,
    }

    RTE.run(prismicPreviewResolverProgram, dependencies)
  }, [
    contextDispatch,
    contextState,
    config.repositoryName,
    config.shouldAutoRedirect,
  ])

  return state
}

import * as React from 'react'
import * as gatsby from 'gatsby'
import * as RTE from 'fp-ts/ReaderTaskEither'
import { pipe, flow } from 'fp-ts/function'
import { Document as PrismicAPIDocument } from 'prismic-javascript/types/documents'

import { Dependencies } from 'shared/types'
import { registerCustomTypes } from 'shared/registerCustomTypes'
import { createBaseTypes } from 'shared/createBaseTypes'
import { createClient, queryById } from 'shared/lib/client'
import { registerAllDocumentTypes } from 'shared/lib/registerAllDocumentTypes'
import { createNode } from 'shared/lib/createNode'

import { usePrismicContext } from './context'
import { buildDependencies } from './buildDependencies'
import { getURLSearchParam } from './lib/getURLSearchParam'

enum ActionType {
  IsPreview = 'IsPreview',
  IsNotPreview = 'IsNotPreview',
  DocumentLoaded = 'DocumentLoaded',
}

type Action =
  | { type: ActionType.IsPreview }
  | { type: ActionType.IsNotPreview }
  | {
      type: ActionType.DocumentLoaded
      payload: { path: string; node: gatsby.NodeInput }
    }

interface State {
  isPreview?: boolean
  isLoading: boolean
  path?: string
  // TODO: This will need to be a proxy once that system is written.
  node?: gatsby.NodeInput
}

const initialState = {
  isPreview: undefined,
  isLoading: false,
  node: undefined,
  path: undefined,
}

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case ActionType.IsPreview: {
      return { ...state, isPreview: true, isLoading: true }
    }

    case ActionType.IsNotPreview: {
      return { ...state, isPreview: false, isLoading: false }
    }

    case ActionType.DocumentLoaded: {
      return {
        ...state,
        isPreview: true,
        isLoading: false,
        path: action.payload.path,
        node: action.payload.node,
      }
    }
  }
}

interface PrismicPreviewProgramDependencies {
  dispatch: (action: Action) => void
}

const isPreview = (): RTE.ReaderTaskEither<
  PrismicPreviewProgramDependencies,
  never,
  void
> =>
  pipe(
    RTE.ask<PrismicPreviewProgramDependencies>(),
    RTE.map((deps) => deps.dispatch({ type: ActionType.IsPreview })),
  )

const isNotPreview = (): RTE.ReaderTaskEither<
  PrismicPreviewProgramDependencies,
  never,
  void
> =>
  pipe(
    RTE.ask<PrismicPreviewProgramDependencies>(),
    RTE.map((deps) => deps.dispatch({ type: ActionType.IsNotPreview })),
  )

const documentLoaded = (
  path: string,
  node: gatsby.NodeInput,
): RTE.ReaderTaskEither<PrismicPreviewProgramDependencies, never, void> =>
  pipe(
    RTE.ask<PrismicPreviewProgramDependencies>(),
    RTE.map((deps) =>
      deps.dispatch({
        type: ActionType.DocumentLoaded,
        payload: { path, node },
      }),
    ),
  )

const prismicPreviewProgram = pipe(
  RTE.ask<PrismicPreviewProgramDependencies & Dependencies>(),
  RTE.chainFirstW(createBaseTypes),
  RTE.chainFirstW(
    flow(registerCustomTypes, RTE.chain(registerAllDocumentTypes)),
  ),
  RTE.bindW('documentId', () =>
    pipe(
      getURLSearchParam('documentId'),
      RTE.fromOption(() => Error('documentId URL parameter not present')),
    ),
  ),
  RTE.bindW('previewRef', () =>
    pipe(
      getURLSearchParam('token'),
      RTE.fromOption(() => Error('token URL parameter not present')),
    ),
  ),
  RTE.chainFirstW(isPreview),
  RTE.bindW('client', createClient),
  RTE.bindW('document', (scope) =>
    pipe(
      queryById(scope.client, scope.documentId, {
        ref: scope.previewRef,
        fetchLinks: scope.pluginOptions.fetchLinks,
        lang: scope.pluginOptions.lang,
      }),
      (t) => RTE.fromTask<Dependencies, Error, PrismicAPIDocument>(t),
    ),
  ),
  RTE.bindW('node', (scope) => createNode(scope.document)),
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
  (rte) =>
    RTE.bracket(
      rte,
      (scope) => documentLoaded(scope.path, scope.node),
      isNotPreview,
    ),
)

export const usePrismicPreview = (repositoryName: string): State => {
  const [state, dispatch] = React.useReducer(reducer, initialState)
  const [contextState, contextDispatch] = usePrismicContext()

  React.useEffect(() => {
    const pluginOptions = contextState.pluginOptionsMap[repositoryName]
    if (!pluginOptions)
      throw Error(
        `usePrismicPreview was configured to use a repository with the name "${repositoryName}" but was not registered in the top-level PrismicProvider component. Please check your repository name and/or PrismicProvider props.`,
      )

    const dependencies = {
      ...buildDependencies(contextDispatch, pluginOptions),
      dispatch,
    }

    RTE.run(prismicPreviewProgram, dependencies)
  }, [])

  return state
}

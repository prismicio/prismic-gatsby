import { useReducer, useEffect, useCallback, useMemo } from 'react'
import { set as setCookie } from 'es-cookie'
import { previewCookie } from 'prismic-javascript'
import { camelCase } from 'camel-case'

import { validateBrowserOptions } from './validateOptions'
import { createClient } from './api'
import { createEnvironment } from './environment.browser'
import { documentToNodes } from './documentsToNodes'
import { isBrowser } from './utils'
import { BROWSER_STORE_KEY } from './constants'

import { Node } from 'gatsby'
import { QueryOptions } from 'prismic-javascript/d.ts/ResolvedApi'
import {
  PluginOptions,
  DocumentsToNodesEnvironmentBrowserContext,
  BrowserPluginOptions,
} from './types'

export type UsePrismicPreviewOptions = Pick<
  PluginOptions,
  | 'repositoryName'
  | 'accessToken'
  | 'linkResolver'
  | 'htmlSerializer'
  | 'fetchLinks'
  | 'lang'
  | 'typePathsFilenamePrefix'
> & {
  pathResolver?: PluginOptions['linkResolver']
  schemasDigest?: string
}

enum ActionType {
  IS_NOT_PREVIEW = 'IS_NOT_PREVIEW',
  IS_PREVIEW = 'IS_PREVIEW',
  DOCUMENT_LOADED = 'DOCUMENT_LOADED',
  RESET = 'RESET',
}

interface Action {
  type: ActionType
  payload?: {
    rootNode: Node
    path?: string
  }
}

interface State {
  isPreview?: boolean
  isLoading: boolean
  previewData?: { [key: string]: Node }
  path?: string
}

const initialState: State = {
  isPreview: undefined,
  isLoading: false,
  previewData: undefined,
  path: undefined,
}

const reducer = (state: State, action: Action) => {
  switch (action.type) {
    case ActionType.IS_NOT_PREVIEW: {
      return { ...state, isPreview: false, isLoading: false }
    }

    case ActionType.IS_PREVIEW: {
      return { ...state, isPreview: true, isLoading: true }
    }

    case ActionType.DOCUMENT_LOADED: {
      if (!action.payload)
        return { ...state, isPreview: false, isLoading: false }

      const { rootNode, path } = action.payload
      const type = camelCase(rootNode.internal.type)
      const previewData = { [type]: rootNode }

      return { ...state, previewData, path, isPreview: true, isLoading: false }
    }

    case ActionType.RESET: {
      return initialState
    }

    default:
      throw new Error('Invalid error')
  }
}

export const usePrismicPreview = (options: UsePrismicPreviewOptions) => {
  const [state, dispatch] = useReducer(reducer, initialState)

  // @ts-expect-error
  const hydratedOptions: UsePrismicPreviewOptions & {
    plugins: []
    schemas: {}
    lang: string
    typePathsFilenamePrefix: string
    schemasDigest: string
  } = useMemo(() => {
    if (!isBrowser) return options

    const context = window[BROWSER_STORE_KEY][options.repositoryName]

    if (!context)
      throw new Error(
        `Could not find plugin context for repository: "${options.repositoryName}". Check that a gatsby-source-plugin instance exists for that repository. `,
      )

    return validateBrowserOptions({
      ...context.pluginOptions,
      schemasDigest: context.schemasDigest,
      // Need to include an empty object because environment.browser.ts is
      // expecting it. We do not include the actual schemas in the browser.
      schemas: {},
      ...options,
    })
  }, [options])

  const { token, documentId } = useMemo(() => {
    if (!isBrowser) return {}

    const params = new URLSearchParams(window.location.search)

    return {
      token: params.get('token') ?? undefined,
      documentId: params.get('documentId') ?? undefined,
    }
  }, [isBrowser ? window.location.search : undefined])

  /**
   * Set the preview status as soon as possible.
   */
  useEffect(() => {
    const isPreview = Boolean(token && documentId)

    dispatch({
      type: isPreview ? ActionType.IS_PREVIEW : ActionType.IS_NOT_PREVIEW,
    })
  }, [token, documentId])

  const asyncEffect = useCallback(async () => {
    if (!state.isPreview || !token || !documentId) return

    setCookie(previewCookie, token)

    const queryOptions: QueryOptions = {}
    if (hydratedOptions.fetchLinks)
      queryOptions.fetchLinks = hydratedOptions.fetchLinks

    // Query Prismic's API for the document.
    const client = await createClient(
      hydratedOptions.repositoryName,
      hydratedOptions.accessToken,
    )
    const doc = await client.getByID(documentId, queryOptions)

    // Process the document into nodes.
    const typePathsRes = await fetch(
      `/${hydratedOptions.typePathsFilenamePrefix}${hydratedOptions.schemasDigest}.json`,
      { headers: { 'Content-Type': 'application/json' } },
    )
    const typePaths = await typePathsRes.json()
    const env = createEnvironment(
      hydratedOptions as BrowserPluginOptions,
      typePaths,
    )
    const { context } = env
    const { getNodeById } = context as DocumentsToNodesEnvironmentBrowserContext
    const rootNodeId = await documentToNodes(doc, env)
    const rootNode = getNodeById(rootNodeId)

    const resolvedPathResolver =
      hydratedOptions.pathResolver ?? hydratedOptions.linkResolver
    const path = resolvedPathResolver
      ? resolvedPathResolver({ node: doc })(doc)
      : undefined

    dispatch({ type: ActionType.DOCUMENT_LOADED, payload: { rootNode, path } })
  }, [state.isPreview])

  useEffect(() => {
    asyncEffect()
  }, [asyncEffect])

  return state
}

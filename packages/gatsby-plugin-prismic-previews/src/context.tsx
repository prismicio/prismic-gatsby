import * as React from 'react'
import * as Rr from 'fp-ts/Reader'
import * as R from 'fp-ts/Record'
import * as O from 'fp-ts/Option'
import * as IOE from 'fp-ts/IOEither'
import * as IO from 'fp-ts/IO'
import { pipe } from 'fp-ts/function'

import { COOKIE_ACCESS_TOKEN_NAME, WINDOW_CONTEXTS_KEY } from './constants'
import {
  PluginOptions,
  PrismicAPIDocumentNodeInput,
  TypePathsStore,
} from './types'
import { getCookie } from './lib/getCookie'
import { sprintf } from './lib/sprintf'

declare global {
  interface Window {
    [WINDOW_CONTEXTS_KEY]: Record<string, PrismicContext>
  }
}

/**
 * Shared global record holding all contexts in memory. This object holds a
 * React Context instance for each Prismic repository in `gatsby-config.js`
 * that supports previews.
 */
if (typeof window !== 'undefined') {
  window[WINDOW_CONTEXTS_KEY] = {}
}

/**
 * Returns a PrismicContext value for the requested repository. The return
 * value is wrapped in an `Option`, which may be empty if a context does not
 * exist for the repository.
 */
export const getPrismicContext = (
  repositoryName: string,
): O.Option<PrismicContext> =>
  pipe(window[WINDOW_CONTEXTS_KEY], R.lookup(repositoryName))

export type PrismicContext = React.Context<PrismicContextValue>

export type PrismicContextValue = readonly [
  PrismicContextState,
  React.Dispatch<PrismicContextAction>,
]

export interface PrismicContextState {
  repositoryName: string
  pluginOptions: PluginOptions
  /** Record of Prismic document nodes keyed by their `prismicId` field. */
  nodes: Record<string, PrismicAPIDocumentNodeInput>
  typePaths: TypePathsStore
  rootNodeMap: Record<string, string>
  isBootstrapped: boolean
}

export enum PrismicContextActionType {
  SetAccessToken = 'SetAccessToken',
  CreateRootNodeRelationship = 'CreateRootNodeRelationship',
  AppendNodes = 'AppendDocuments',
  AppendTypePaths = 'AppendTypePaths',
  Bootstrapped = 'Bootstrapped',
}

export type PrismicContextAction =
  | {
      type: PrismicContextActionType.SetAccessToken
      payload: string
    }
  | {
      type: PrismicContextActionType.AppendNodes
      payload: PrismicAPIDocumentNodeInput[]
    }
  | {
      type: PrismicContextActionType.AppendTypePaths
      payload: TypePathsStore
    }
  | {
      type: PrismicContextActionType.Bootstrapped
    }
  | {
      type: PrismicContextActionType.CreateRootNodeRelationship
      payload: { path: string; documentId: string }
    }

export const contextReducer = (
  state: PrismicContextState,
  action: PrismicContextAction,
): PrismicContextState => {
  switch (action.type) {
    case PrismicContextActionType.AppendNodes: {
      const nodesMap = action.payload.reduce((acc, node) => {
        acc[node.prismicId] = node

        return acc
      }, {} as PrismicContextState['nodes'])

      return {
        ...state,
        nodes: {
          ...state.nodes,
          ...nodesMap,
        },
      }
    }

    case PrismicContextActionType.AppendTypePaths: {
      return {
        ...state,
        typePaths: {
          ...state.typePaths,
          ...action.payload,
        },
      }
    }

    case PrismicContextActionType.SetAccessToken: {
      return {
        ...state,
        pluginOptions: {
          ...state.pluginOptions,
          accessToken: action.payload,
        },
      }
    }

    case PrismicContextActionType.CreateRootNodeRelationship: {
      return {
        ...state,
        rootNodeMap: {
          ...state.rootNodeMap,
          [action.payload.path]: action.payload.documentId,
        },
      }
    }

    case PrismicContextActionType.Bootstrapped: {
      return {
        ...state,
        isBootstrapped: true,
      }
    }
  }
}

export interface CreatePrismicContextEnv {
  pluginOptions: PluginOptions
}

// Populate a plugin options' `accessToken` value with one stored in a persisted
// cookie, if available. If an access token already exists in the plugin
// options, that token takes priority.
const populateAccessToken = (
  pluginOptions: PluginOptions,
): IO.IO<PluginOptions> =>
  pipe(
    IOE.Do,
    IOE.chain(
      IOE.fromPredicate(
        () => pluginOptions.accessToken == null,
        () => new Error('Access token is already populated'),
      ),
    ),
    IOE.bind('cookieName', () =>
      IOE.of(sprintf(COOKIE_ACCESS_TOKEN_NAME, pluginOptions.repositoryName)),
    ),
    IOE.bindW('accessToken', (scope) => getCookie(scope.cookieName)),
    IOE.map((scope) => ({ ...pluginOptions, accessToken: scope.accessToken })),
    IOE.getOrElse(() => IO.of(pluginOptions)),
  )

const buildInitialState: Rr.Reader<
  CreatePrismicContextEnv,
  PrismicContextState
> = pipe(
  Rr.asks((env: CreatePrismicContextEnv) => ({
    repositoryName: env.pluginOptions.repositoryName,
    pluginOptions: env.pluginOptions,
    nodes: {},
    typePaths: {},
    rootNodeMap: {},
    isBootstrapped: false,
  })),
  Rr.map((state) => ({
    ...state,
    pluginOptions: populateAccessToken(state.pluginOptions)(),
  })),
)

export type PrismicProviderProps = {
  children?: React.ReactNode
}

export const createPrismicContext: Rr.Reader<
  CreatePrismicContextEnv,
  React.ComponentType<PrismicProviderProps>
> = pipe(
  Rr.ask<CreatePrismicContextEnv>(),
  Rr.bind('initialState', () => buildInitialState),
  Rr.bind('defaultValue', (env) =>
    Rr.of([
      env.initialState,
      (_: PrismicContextAction): void => void 0,
    ] as const),
  ),
  Rr.bind('context', (env) => Rr.of(React.createContext(env.defaultValue))),
  Rr.chainFirst((env) =>
    Rr.of(
      (env.context.displayName = `PrismicPreview(${env.pluginOptions.repositoryName})`),
    ),
  ),
  Rr.chainFirst((env) =>
    Rr.of(
      (window[WINDOW_CONTEXTS_KEY][env.pluginOptions.repositoryName] =
        env.context),
    ),
  ),
  Rr.map((env) => (props: PrismicProviderProps): JSX.Element => {
    const Context = env.context
    const reducerTuple = React.useReducer(contextReducer, env.initialState)

    return (
      <Context.Provider value={reducerTuple}>{props.children}</Context.Provider>
    )
  }),
)

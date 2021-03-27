import * as React from 'react'
import * as IOE from 'fp-ts/IOEither'
import * as IO from 'fp-ts/IO'
import * as R from 'fp-ts/Record'
import { pipe } from 'fp-ts/function'

import {
  COOKIE_ACCESS_TOKEN_NAME,
  WINDOW_PLUGIN_OPTIONS_KEY,
} from './constants'
import {
  PluginOptions,
  PrismicAPIDocumentNodeInput,
  TypePathsStore,
} from './types'
import { getCookie } from './lib/getCookie'
import { sprintf } from './lib/sprintf'
import { ssrPluginOptionsStore } from './lib/setPluginOptionsOnWindow'

if (typeof window !== 'undefined') {
  window[WINDOW_PLUGIN_OPTIONS_KEY] = {}
}

/**
 * Populate a plugin options' `accessToken` value with one stored in a persisted
 * cookie, if available. If an access token already exists in the plugin
 * options, that token takes priority.
 */
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

const initRepositoryState = (
  pluginOptions: PluginOptions,
): IO.IO<PrismicContextRepositoryState> =>
  pipe(
    populateAccessToken(pluginOptions),
    IO.map((pluginOptions) => ({
      pluginOptions,
      repositoryName: pluginOptions.repositoryName,
      nodes: {},
      typePaths: {},
      rootNodeMap: {},
      isBootstrapped: false,
    })),
  )

const isPrismicAPIDocumentNodeInput = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any,
): value is PrismicAPIDocumentNodeInput =>
  typeof value === 'object' && 'prismicId' in value

export type PrismicContextValue = readonly [
  PrismicContextState,
  React.Dispatch<PrismicContextAction>,
]

export type PrismicContextState = Record<string, PrismicContextRepositoryState>

export interface PrismicContextRepositoryState {
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
      payload: { repositoryName: string; accessToken: string }
    }
  | {
      type: PrismicContextActionType.AppendNodes
      payload: { repositoryName: string; nodes: unknown[] }
    }
  | {
      type: PrismicContextActionType.AppendTypePaths
      payload: { repositoryName: string; typePaths: TypePathsStore }
    }
  | {
      type: PrismicContextActionType.Bootstrapped
      payload: { repositoryName: string }
    }
  | {
      type: PrismicContextActionType.CreateRootNodeRelationship
      payload: { repositoryName: string; path: string; documentId: string }
    }

export const contextReducer = (
  state: PrismicContextState,
  action: PrismicContextAction,
): PrismicContextState => {
  const repositoryName = action.payload.repositoryName

  switch (action.type) {
    case PrismicContextActionType.AppendNodes: {
      const nodesMap = action.payload.nodes.reduce(
        (acc: PrismicContextRepositoryState['nodes'], node) => {
          if (isPrismicAPIDocumentNodeInput(node)) {
            acc[node.prismicId] = node
          }

          return acc
        },
        {},
      )

      return {
        ...state,
        [repositoryName]: {
          ...state[repositoryName],
          nodes: {
            ...state[repositoryName].nodes,
            ...nodesMap,
          },
        },
      }
    }

    case PrismicContextActionType.AppendTypePaths: {
      return {
        ...state,
        [repositoryName]: {
          ...state[repositoryName],
          typePaths: {
            ...state[repositoryName].typePaths,
            ...action.payload.typePaths,
          },
        },
      }
    }

    case PrismicContextActionType.SetAccessToken: {
      return {
        ...state,
        [repositoryName]: {
          ...state[repositoryName],
          pluginOptions: {
            ...state[repositoryName].pluginOptions,
            accessToken: action.payload.accessToken,
          },
        },
      }
    }

    case PrismicContextActionType.CreateRootNodeRelationship: {
      return {
        ...state,
        [repositoryName]: {
          ...state[repositoryName],
          rootNodeMap: {
            ...state[repositoryName].rootNodeMap,
            [action.payload.path]: action.payload.documentId,
          },
        },
      }
    }

    case PrismicContextActionType.Bootstrapped: {
      return {
        ...state,
        [repositoryName]: {
          ...state[repositoryName],
          isBootstrapped: true,
        },
      }
    }
  }
}

const createInitialState = (): IO.IO<PrismicContextState> =>
  pipe(
    typeof window === 'undefined'
      ? ssrPluginOptionsStore
      : window[WINDOW_PLUGIN_OPTIONS_KEY],
    R.map(initRepositoryState),
    R.sequence(IO.io),
  )

const defaultInitialState: PrismicContextState = {}
const defaultContextValue: PrismicContextValue = [
  defaultInitialState,
  () => void 0,
]

export const PrismicContext = React.createContext(defaultContextValue)

export type PrismicProviderProps = {
  children?: React.ReactNode
}

export const PrismicPreviewProvider = ({
  children,
}: PrismicProviderProps): JSX.Element => {
  const initialState = createInitialState()()
  const reducerTuple = React.useReducer(contextReducer, initialState)

  return (
    <PrismicContext.Provider value={reducerTuple}>
      {children}
    </PrismicContext.Provider>
  )
}

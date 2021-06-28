import * as React from 'react'
import * as IOE from 'fp-ts/IOEither'
import * as IO from 'fp-ts/IO'
import * as R from 'fp-ts/Record'
import { pipe } from 'fp-ts/function'

import {
  COOKIE_ACCESS_TOKEN_NAME,
  WINDOW_PLUGIN_OPTIONS_KEY,
  WINDOW_PROVIDER_PRESENCE_KEY,
} from './constants'
import {
  PluginOptions,
  PrismicAPIDocumentNodeInput,
  TypePathsStore,
} from './types'
import { getCookie } from './lib/getCookie'
import { sprintf } from './lib/sprintf'
import { ssrPluginOptionsStore } from './lib/setPluginOptionsOnWindow'

declare global {
  interface Window {
    [WINDOW_PROVIDER_PRESENCE_KEY]: boolean
  }
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

/**
 * Determines if a value is a Gatsby node for a Prismic document.
 *
 * @param value Value to check.
 *
 * @returns `true` if value is a Gatsby node for a Prismic document, `false` otherwise.
 */
const isPrismicAPIDocumentNodeInput = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any,
): value is PrismicAPIDocumentNodeInput =>
  typeof value === 'object' && 'prismicId' in value

export type PrismicContextValue = readonly [
  PrismicContextState,
  React.Dispatch<PrismicContextAction>,
]

export type PrismicContextState = {
  activeRepositoryName: string | undefined
  isBootstrapped: boolean
  /** Record of Prismic document nodes keyed by their `prismicId` field. */
  nodes: Record<string, PrismicAPIDocumentNodeInput>
  /** Record of document IDs to be added as a root data field keyed by its resolved page URL. */
  rootNodeMap: Record<string, string>
  /** Record of plugin options keyed by their repository name. */
  pluginOptionsStore: Record<string, PluginOptions>
  /** Record of type paths keyed by their repository name. */
  typePathsStore: Record<string, TypePathsStore>
}

export enum PrismicContextActionType {
  SetActiveRepositoryName = 'SetActiveRepositoryName',
  SetAccessToken = 'SetAccessToken',
  CreateRootNodeRelationship = 'CreateRootNodeRelationship',
  AppendNodes = 'AppendDocuments',
  AppendTypePaths = 'AppendTypePaths',
  Bootstrapped = 'Bootstrapped',
}

export type PrismicContextAction =
  | {
      type: PrismicContextActionType.SetActiveRepositoryName
      payload: { repositoryName: string }
    }
  | {
      type: PrismicContextActionType.SetAccessToken
      payload: { repositoryName: string; accessToken: string }
    }
  | {
      type: PrismicContextActionType.AppendNodes
      payload: { nodes: unknown[] }
    }
  | {
      type: PrismicContextActionType.AppendTypePaths
      payload: { repositoryName: string; typePaths: TypePathsStore }
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
    case PrismicContextActionType.SetActiveRepositoryName: {
      return {
        ...state,
        activeRepositoryName: action.payload.repositoryName,
      }
    }

    case PrismicContextActionType.AppendNodes: {
      const nodes = action.payload.nodes.reduce(
        (acc: PrismicContextState['nodes'], node) => {
          if (isPrismicAPIDocumentNodeInput(node)) {
            acc[node.prismicId] = node
          }

          return acc
        },
        state.nodes,
      )

      return { ...state, nodes }
    }

    case PrismicContextActionType.AppendTypePaths: {
      return {
        ...state,
        typePathsStore: {
          ...state.typePathsStore,
          [action.payload.repositoryName]: action.payload.typePaths,
        },
      }
    }

    case PrismicContextActionType.SetAccessToken: {
      const repositoryName = action.payload.repositoryName

      return {
        ...state,
        pluginOptionsStore: {
          ...state.pluginOptionsStore,
          [repositoryName]: {
            ...state.pluginOptionsStore[repositoryName],
            accessToken: action.payload.accessToken,
          },
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

const defaultInitialState: PrismicContextState = {
  activeRepositoryName: undefined,
  isBootstrapped: false,
  nodes: {},
  pluginOptionsStore: {},
  typePathsStore: {},
  rootNodeMap: {},
}

const createInitialState = (): IO.IO<PrismicContextState> =>
  pipe(
    typeof window === 'undefined'
      ? ssrPluginOptionsStore
      : window[WINDOW_PLUGIN_OPTIONS_KEY],
    R.map(populateAccessToken),
    R.sequence(IO.Applicative),
    IO.map((pluginOptionsStore) => ({
      ...defaultInitialState,
      pluginOptionsStore,
    })),
  )

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

  React.useLayoutEffect(() => {
    window[WINDOW_PROVIDER_PRESENCE_KEY] = true
  }, [])

  return (
    <PrismicContext.Provider value={reducerTuple}>
      {children}
    </PrismicContext.Provider>
  )
}

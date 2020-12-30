import * as React from 'react'
import * as gatsby from 'gatsby'
import { TypePathsStore } from 'gatsby-source-prismic'

import { PluginOptions } from './types'

export enum PrismicContextActionType {
  CreateNode = 'CreateNode',
  SetAccessToken = 'SetAccessToken',
  CreateRootNodeRelationship = 'CreateRootNodeRelationship',
  IsBootstrapped = 'IsBootstrapped',
}

export type PrismicContextAction =
  | {
      type: PrismicContextActionType.CreateNode
      payload: gatsby.NodeInput & { prismicId?: string }
    }
  | {
      type: PrismicContextActionType.SetAccessToken
      payload: { repositoryName: string; accessToken: string }
    }
  | {
      type: PrismicContextActionType.CreateRootNodeRelationship
      payload: { path: string; nodeId: string }
    }
  | {
      type: PrismicContextActionType.IsBootstrapped
      payload: { repositoryName: string }
    }

export interface PrismicContextState {
  pluginOptionsMap: Record<string, PluginOptions>
  nodes: Record<string, gatsby.NodeInput>
  typePathsStore: TypePathsStore
  rootNodeMap: Record<string, string>
  isBootstrappedMap: Record<string, boolean>
}

const createInitialState = (
  typePathsStore: TypePathsStore = {},
  pluginOptionsMap: Record<string, PluginOptions> = {},
): PrismicContextState => ({
  nodes: {},
  rootNodeMap: {},
  isBootstrappedMap: {},
  typePathsStore,
  pluginOptionsMap,
})

const reducer = (
  state: PrismicContextState,
  action: PrismicContextAction,
): PrismicContextState => {
  switch (action.type) {
    case PrismicContextActionType.CreateNode: {
      return {
        ...state,
        nodes: {
          ...state.nodes,
          [action.payload.prismicId ?? action.payload.id]: action.payload,
        },
      }
    }

    case PrismicContextActionType.SetAccessToken: {
      return {
        ...state,
        pluginOptionsMap: {
          ...state.pluginOptionsMap,
          [action.payload.repositoryName]: {
            ...state.pluginOptionsMap[action.payload.repositoryName],
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
          [action.payload.path]: action.payload.nodeId,
        },
      }
    }

    case PrismicContextActionType.IsBootstrapped: {
      return {
        ...state,
        isBootstrappedMap: {
          ...state.isBootstrappedMap,
          [action.payload.repositoryName]: true,
        },
      }
    }
  }
}

const PrismicContext = React.createContext([
  createInitialState(),
  (action: PrismicContextAction): void => {
    void action
  },
] as const)

type PrismicProviderProps = {
  pluginOptions: Record<string, PluginOptions>
  children?: React.ReactNode
}

export const PrismicProvider = ({
  pluginOptions: pluginOptionsMap,
  children,
}: PrismicProviderProps): React.ReactNode => {
  // TODO: Get the typePathsStore from Gatsby's cache
  const typePathsStore = {}

  // TODO: Get plugin options from gatsby-browser.js and merge with
  // `pluginOptions` prop. `pluginOptions` can be treated as overrides, but
  // linkResolver and htmlSerializer can *only* be provided via the prop. All
  // other options can be provided via gatsby-config.js

  const reducerTuple = React.useReducer(
    reducer,
    createInitialState(typePathsStore, pluginOptionsMap),
  )

  return (
    <PrismicContext.Provider value={reducerTuple}>
      {children}
    </PrismicContext.Provider>
  )
}

export const usePrismicContext = (): typeof PrismicContext extends React.Context<
  infer U
>
  ? U
  : never => React.useContext(PrismicContext)

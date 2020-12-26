import * as React from 'react'
import * as gatsby from 'gatsby'
import * as A from 'fp-ts/Array'
import * as E from 'fp-ts/Either'
import * as R from 'fp-ts/Record'
import * as S from 'fp-ts/Semigroup'
import { pipe } from 'fp-ts/function'
import * as D from 'io-ts/Decoder'
import { PluginOptions } from 'gatsby-source-prismic/dist/types'
import { PluginOptionsD } from 'gatsby-source-prismic/dist/lib/PluginOptionsD'

import { castArray } from './lib/castArray'

export enum PrismicContextActionType {
  CreateNode = 'CreateNode',
  CreateType = 'CreateType',
  DeleteNode = 'DeleteNode',
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
      type: PrismicContextActionType.CreateType
      payload: gatsby.GatsbyGraphQLType
    }
  | {
      type: PrismicContextActionType.DeleteNode
      payload: gatsby.Node
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
  types: Record<string, gatsby.GatsbyGraphQLType>
  rootNodeMap: Record<string, string>
  isBootstrappedMap: Record<string, boolean>
}

const createInitialState = (
  pluginOptionsList: PluginOptions[] = [],
): PrismicContextState =>
  pipe(
    E.right({
      nodes: {},
      types: {},
      rootNodeMap: {},
      isBootstrappedMap: {},
    }),
    E.bind('pluginOptionsMap', () =>
      pipe(
        pluginOptionsList,
        A.map(PluginOptionsD.decode),
        A.sequence(E.either),
        E.mapLeft((error) => new Error(D.draw(error))),
        E.map((pluginOptionsList) =>
          R.fromFoldableMap(
            S.getLastSemigroup<PluginOptions>(),
            A.array,
          )(pluginOptionsList, (pluginOptions) => [
            pluginOptions.repositoryName,
            pluginOptions,
          ]),
        ),
      ),
    ),
    E.getOrElse((error) => {
      E.throwError(error)
      return {
        pluginOptionsMap: {},
        nodes: {},
        types: {},
        rootNodeMap: {},
        isBootstrappedMap: {},
      } as PrismicContextState
    }),
  )

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

    case PrismicContextActionType.CreateType: {
      return {
        ...state,
        types: {
          ...state.types,
          [action.payload.config.name]: action.payload,
        },
      }
    }

    case PrismicContextActionType.DeleteNode: {
      const {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        [action.payload.id]: _deletedNode,
        ...remainingNodes
      } = state.nodes

      return {
        ...state,
        nodes: remainingNodes,
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
  pluginOptions: PluginOptions | PluginOptions[]
  children?: React.ReactNode
}

export const PrismicProvider = ({
  pluginOptions: pluginOptionsList,
  children,
}: PrismicProviderProps): React.ReactNode => {
  const reducerTuple = React.useReducer(
    reducer,
    createInitialState(castArray(pluginOptionsList)),
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

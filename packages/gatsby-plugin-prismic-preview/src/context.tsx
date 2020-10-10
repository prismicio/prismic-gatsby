import * as React from 'react'
import * as gatsby from 'gatsby'
import * as A from 'fp-ts/Array'
import * as E from 'fp-ts/Either'
import * as R from 'fp-ts/Record'
import * as S from 'fp-ts/Semigroup'
import { pipe } from 'fp-ts/function'
import * as D from 'io-ts/Decoder'

import { PluginOptions } from 'shared/types'

import { castArray } from './lib/castArray'
import { PluginOptionsD } from 'shared/decoders'

export enum PrismicContextActionType {
  CreateNode = 'CreateNode',
  CreateType = 'CreateType',
  UpdateAccessToken = 'UpdateAccessToken',
}

export type PrismicContextAction =
  | {
      type: PrismicContextActionType.CreateNode
      payload: gatsby.NodeInput
    }
  | {
      type: PrismicContextActionType.CreateType
      payload: gatsby.GatsbyGraphQLType
    }
  | {
      type: PrismicContextActionType.UpdateAccessToken
      payload: {
        repositoryName: string
        accessToken: string
      }
    }

interface PrismicContextState {
  pluginOptionsMap: Record<string, PluginOptions>
  nodes: Record<string, gatsby.NodeInput>
  types: Record<string, gatsby.GatsbyGraphQLType>
}

const createInitialState = (
  pluginOptionsList: PluginOptions[] = [],
): PrismicContextState =>
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
    E.bindTo('pluginOptionsMap'),
    E.bind('nodes', () => E.right({})),
    E.bind('types', () => E.right({})),
    E.getOrElse((error) => {
      E.throwError(error)
      return { pluginOptionsMap: {}, nodes: {}, types: {} }
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
          [action.payload.id]: action.payload,
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

    case PrismicContextActionType.UpdateAccessToken: {
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

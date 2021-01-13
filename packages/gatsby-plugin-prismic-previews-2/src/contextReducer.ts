import * as React from 'react'
import { PluginOptions, PrismicAPIDocument, TypePathsStore } from './types'

export type PrismicContext = React.Context<PrismicContextValue>

export type PrismicContextValue = readonly [
  PrismicContextState,
  React.Dispatch<PrismicContextAction>,
]

export interface PrismicContextState {
  repositoryName: string
  pluginOptions: PluginOptions
  documents: Record<string, PrismicAPIDocument>
  typePaths: TypePathsStore
  rootNodeMap: Record<string, string>
  isBootstrapped: boolean
}

export enum PrismicContextActionType {
  SetAccessToken = 'SetAccessToken',
  CreateRootNodeRelationship = 'CreateRootNodeRelationship',
  AppendDocuments = 'AppendDocuments',
  Bootstrapped = 'Bootstrapped',
}

export type PrismicContextAction =
  | {
      type: PrismicContextActionType.SetAccessToken
      payload: string
    }
  | {
      type: PrismicContextActionType.AppendDocuments
      payload: PrismicAPIDocument[]
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
    case PrismicContextActionType.AppendDocuments: {
      const documentsMap = action.payload.reduce((acc, doc) => {
        acc[doc.id] = doc

        return acc
      }, {} as PrismicContextState['documents'])

      return {
        ...state,
        documents: {
          ...state.documents,
          ...documentsMap,
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

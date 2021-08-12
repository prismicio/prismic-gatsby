import * as prismicT from '@prismicio/types'
import {
  createStore,
  applyMiddleware,
  bindActionCreators,
  Reducer,
} from 'redux'
import reduxThunk, { ThunkAction } from 'redux-thunk'

import { PrismicDocumentNodeInput, TypePath } from '../types'
import { normalizeDocument } from './normalizeDocument'

enum ActionType {
  RegisterDocuments,
  RegisterTypePaths,
}

type Action =
  | {
      type: ActionType.RegisterDocuments
      payload: { documents: prismicT.PrismicDocument[] }
    }
  | {
      type: ActionType.RegisterTypePaths
      payload: { typePaths: TypePath[] }
    }

interface State {
  nodes: PrismicDocumentNodeInput[]
  typePaths: TypePath[]
}

const initialState: State = {
  nodes: [],
  typePaths: [],
}

const reducer: Reducer<State, Action> = (state, action) => {
  if (state === undefined) {
    return initialState
  }

  switch (action.type) {
    case ActionType.RegisterDocuments: {
      const nodes = action.payload.documents.map((document) =>
        normalizeDocument(document),
      )

      return {
        ...state,
        nodes,
      }
    }

    case ActionType.RegisterTypePaths: {
      return {
        ...state,
        typePaths: action.payload.typePaths,
      }
    }
  }
}

const store = createStore(reducer, applyMiddleware(reduxThunk))

store.dispatch({
  type: ActionType.RegisterDocuments,
  payload: { documents: [] },
})

export const actions = bindActionCreators(
  {
    registerDocuments: (documents: prismicT.PrismicDocument) => {
      return (dispatch) =>
        dispatch({
          type: ActionType.RegisterDocuments,
          payload: { documents: documents },
        })
    },
  },
  store.dispatch,
)

// const registerDocuments = (documents: prismicT.PrismicDocument): Thunk

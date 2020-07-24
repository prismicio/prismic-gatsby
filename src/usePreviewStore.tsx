import * as React from 'react'
import { NodeTree } from './types'

const DEFAULT_INITIAL_PAGES = {}
const DEFAULT_INITIAL_ENABLED = false

export enum ActionType {
  AddPage,
  EnablePreviews,
  DisablePreviews,
}

type Action =
  | {
      type: ActionType.AddPage
      payload: { path: string; data: NodeTree }
    }
  | { type: Exclude<ActionType, ActionType.AddPage> }

interface State {
  pages: Record<string, NodeTree>
  enabled: boolean
}

const createInitialState = (initialState?: Partial<State>): State => ({
  pages: DEFAULT_INITIAL_PAGES,
  enabled: DEFAULT_INITIAL_ENABLED,
  ...initialState,
})

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case ActionType.AddPage: {
      return {
        ...state,
        pages: {
          ...state.pages,
          [action.payload.path]: action.payload.data,
        },
        enabled: true,
      }
    }

    case ActionType.EnablePreviews: {
      return { ...state, enabled: true }
    }

    case ActionType.DisablePreviews: {
      return { ...state, enabled: false }
    }
  }
}

const PreviewStoreContext = React.createContext([
  createInitialState(),
  () => {},
] as [State, React.Dispatch<Action>])

export type PreviewStoreProviderProps = {
  children?: React.ReactNode
  initialPages?: State['pages']
  initialEnabled?: State['enabled']
}

export const PreviewStoreProvider = ({
  children,
  initialPages = DEFAULT_INITIAL_PAGES,
  initialEnabled = DEFAULT_INITIAL_ENABLED,
}: PreviewStoreProviderProps) => {
  const reducerTuple = React.useReducer(
    reducer,
    createInitialState({
      pages: initialPages,
      enabled: initialEnabled,
    }),
  )

  return (
    <PreviewStoreContext.Provider value={reducerTuple}>
      {children}
    </PreviewStoreContext.Provider>
  )
}

export const usePreviewStore = () => React.useContext(PreviewStoreContext)

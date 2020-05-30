import * as React from 'react'

export enum ActionType {
  AddPage,
  EnablePreviews,
  DisablePreviews,
}

type Action =
  | {
      type: ActionType.AddPage
      payload: { path: string; data: object }
    }
  | { type: Exclude<ActionType, ActionType.AddPage> }

interface State {
  pages: Record<string, object>
  enabled: boolean
}

const initialState: State = {
  pages: {},
  enabled: false,
}

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

const PreviewStoreContext = React.createContext([initialState, () => {}] as [
  State,
  React.Dispatch<Action>,
])

export type PreviewStoreProviderProps = {
  children?: React.ReactNode
}

export const PreviewStoreProvider = ({
  children,
}: PreviewStoreProviderProps) => {
  const reducerTuple = React.useReducer(reducer, initialState)

  return (
    <PreviewStoreContext.Provider value={reducerTuple}>
      {children}
    </PreviewStoreContext.Provider>
  )
}

export const usePreviewStore = () => React.useContext(PreviewStoreContext)

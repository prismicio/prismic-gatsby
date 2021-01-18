import * as React from 'react'
import * as Rr from 'fp-ts/Reader'
import * as R from 'fp-ts/Record'
import * as O from 'fp-ts/Option'
import { pipe } from 'fp-ts/function'

import { WINDOW_CONTEXTS_KEY } from './constants'
import { PluginOptions } from './types'
import {
  contextReducer,
  PrismicContext,
  PrismicContextAction,
  PrismicContextState,
  PrismicContextValue,
} from './contextReducer'

declare global {
  interface Window {
    [WINDOW_CONTEXTS_KEY]: Record<string, PrismicContext>;
  }
}

/**
 * Shared global record holding all contexts in memory. This object holds a
 * React Context instance for each Prismic repository in `gatsby-config.js`
 * that supports previews.
 */
window[WINDOW_CONTEXTS_KEY] = {}

export type PrismicProviderProps = {
  children?: React.ReactNode;
}

export interface CreatePrismicContextEnv {
  pluginOptions: PluginOptions;
}

const buildInitialState: Rr.Reader<
  CreatePrismicContextEnv,
  PrismicContextState
> = Rr.asks((env) => ({
  repositoryName: env.pluginOptions.repositoryName,
  pluginOptions: env.pluginOptions,
  documents: {},
  typePaths: {},
  rootNodeMap: {},
  isBootstrapped: false,
}))

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

export const usePrismicPreviewContext = (
  repositoryName: string,
): PrismicContextValue =>
  pipe(
    window[WINDOW_CONTEXTS_KEY],
    R.lookup(repositoryName),
    O.fold(() => {
      throw new Error(
        `Could not find a React Context for repository "${repositoryName}"`,
      )
    }, React.useContext),
  )

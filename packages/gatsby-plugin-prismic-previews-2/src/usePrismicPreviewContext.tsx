import * as React from 'react'
import * as RE from 'fp-ts/ReaderEither'
import * as O from 'fp-ts/Option'
import { constVoid, pipe } from 'fp-ts/function'

import { PluginOptions } from './types'
import {
  contextReducer,
  PrismicContext,
  PrismicContextAction,
  PrismicContextState,
  PrismicContextValue,
} from './contextReducer'

/**
 * Singleton holding all contexts in memory. When multiple repositories with
 * preview support are configured in `gatsby-config.js`, this object holds a
 * React Context instance for each.
 */
const CONTEXTS = {} as Record<string, PrismicContext>

export type PrismicProviderProps = {
  children?: React.ReactNode;
}

export interface CreateStoreContextEnv {
  pluginOptions: PluginOptions;
}

const buildInitialState: RE.ReaderEither<
  CreateStoreContextEnv,
  never,
  PrismicContextState
> = RE.asks((env) => ({
  repositoryName: env.pluginOptions.repositoryName,
  pluginOptions: env.pluginOptions,
  documents: {},
  typePaths: {},
  rootNodeMap: {},
  isBootstrapped: false,
}))

const registerContext = (
  context: PrismicContext,
): RE.ReaderEither<CreateStoreContextEnv, never, void> =>
  pipe(
    RE.ask<CreateStoreContextEnv>(),
    RE.chainFirst((env) =>
      RE.of((CONTEXTS[env.pluginOptions.repositoryName] = context)),
    ),
    (x) => {
      console.log({ x, CONTEXTS })

      return x
    },
    RE.map(constVoid),
  )
// RE.asks((env) => {
//   CONTEXTS[env.pluginOptions.repositoryName] = context
// })

export const createPrismicContext: RE.ReaderEither<
  CreateStoreContextEnv,
  never,
  React.ComponentType<PrismicProviderProps>
> = pipe(
  RE.ask<CreateStoreContextEnv>(),
  RE.bind('initialState', () => buildInitialState),
  RE.bind('defaultValue', (env) =>
    RE.of([
      env.initialState,
      (_: PrismicContextAction): void => void 0,
    ] as const),
  ),
  RE.bind('context', (env) => RE.of(React.createContext(env.defaultValue))),
  RE.chainFirst((env) =>
    RE.of(
      (env.context.displayName = `PrismicPreview(${env.pluginOptions.repositoryName})`),
    ),
  ),
  RE.chainFirst((env) => registerContext(env.context)),
  RE.map((env) => ({ children }: PrismicProviderProps): JSX.Element => {
    const PrismicContext = env.context
    const reducerTuple = React.useReducer(contextReducer, env.initialState)

    return (
      <PrismicContext.Provider value={reducerTuple}>
        {children}
      </PrismicContext.Provider>
    )
  }),
)

export const usePrismicPreviewContext = (
  repositoryName: string,
): PrismicContextValue =>
  pipe(
    O.fromNullable(CONTEXTS[repositoryName]),
    O.fold(() => {
      throw new Error(
        `Could not find a React Context for repository "${repositoryName}"`,
      )
    }, React.useContext),
  )

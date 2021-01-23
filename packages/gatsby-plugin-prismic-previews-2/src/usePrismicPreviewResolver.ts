import * as React from 'react'
import * as cookie from 'es-cookie'
import * as RTE from 'fp-ts/ReaderTaskEither'
import * as TE from 'fp-ts/TaskEither'
import * as E from 'fp-ts/Either'
import * as IO from 'fp-ts/IO'
import { constVoid, pipe } from 'fp-ts/function'
import Prismic from 'prismic-javascript'

import { getURLSearchParam } from './lib/getURLSearchParam'
import { createClient, CreateClientEnv } from './lib/createClient'

import { LinkResolver, PrismicAPIDocument } from './types'
import { usePrismicPreviewContext } from './usePrismicPreviewContext'
import { validatePreviewTokenForRepository } from './lib/isPreviewTokenForRepository'
import { normalizePrismicError } from './lib/normalizePrismicError'
import { setCookie } from './lib/setCookie'

export type UsePrismicPreviewResolverFn = () => void

export interface UsePrismicPreviewResolverState {
  state: 'INIT' | 'RESOLVING' | 'RESOLVED' | 'FAILED'
  document?: PrismicAPIDocument
  path?: string
  error?: Error
}

enum UsePrismicPreviewResolverActionType {
  BeginResolving = 'BeginResolving',
  Resolved = 'Resolved',
  Fail = 'Fail',
}

type UsePrismicPreviewResolverAction =
  | {
      type: UsePrismicPreviewResolverActionType.BeginResolving
    }
  | {
      type: UsePrismicPreviewResolverActionType.Resolved
      payload: string
    }
  | {
      type: UsePrismicPreviewResolverActionType.Fail
      payload: Error
    }

const initialLocalState: UsePrismicPreviewResolverState = {
  state: 'INIT',
  document: undefined,
  path: undefined,
}

const localReducer = (
  state: UsePrismicPreviewResolverState,
  action: UsePrismicPreviewResolverAction,
): UsePrismicPreviewResolverState => {
  switch (action.type) {
    case UsePrismicPreviewResolverActionType.BeginResolving: {
      return {
        ...initialLocalState,
        state: 'RESOLVING',
      }
    }

    case UsePrismicPreviewResolverActionType.Resolved: {
      return {
        ...state,
        state: 'RESOLVED',
        path: action.payload,
      }
    }

    case UsePrismicPreviewResolverActionType.Fail: {
      return {
        ...initialLocalState,
        state: 'FAILED',
        error: action.payload,
      }
    }
  }
}

interface UsePrismicPreviewResolverProgramEnv extends CreateClientEnv {
  repositoryName: string
  beginResolving: IO.IO<void>
  resolved(path: string): IO.IO<void>
  linkResolver(doc: PrismicAPIDocument): string
}

const usePrismicPreviewResolverProgram: RTE.ReaderTaskEither<
  UsePrismicPreviewResolverProgramEnv,
  Error,
  void
> = pipe(
  RTE.ask<UsePrismicPreviewResolverProgramEnv>(),
  RTE.bindW('token', () =>
    pipe(
      getURLSearchParam('token'),
      RTE.fromOption(() => new Error('token URL parameter not present')),
    ),
  ),
  RTE.bindW('documentId', () =>
    pipe(
      getURLSearchParam('token'),
      RTE.fromOption(() => new Error('documentId URL parameter not present')),
    ),
  ),

  // Only continue if this preview session is for this repository.
  RTE.chainFirst((env) =>
    RTE.fromEither(
      validatePreviewTokenForRepository(env.repositoryName, env.token),
    ),
  ),

  // Persist the token for resuming this preview session at a later time.
  RTE.chainFirst((env) =>
    RTE.fromIO(setCookie(Prismic.previewCookie, env.token)),
  ),

  RTE.bindW('client', () => createClient),
  RTE.bind('pathResolver', (env) =>
    RTE.of(env.client.getPreviewResolver(env.token, env.documentId)),
  ),

  // Start resolving.
  RTE.chainFirst((env) => RTE.fromIO(env.beginResolving)),

  RTE.bind('path', (env) =>
    RTE.fromTaskEither(
      TE.tryCatch(
        () => env.pathResolver.resolve(env.linkResolver, '/'),
        (error) => normalizePrismicError(error as Error),
      ),
    ),
  ),

  // End resolving.
  RTE.chainFirst((env) => RTE.fromIO(env.resolved(env.path))),

  RTE.map(constVoid),
)

export type UsePrismicPreviewResolverConfig = {
  linkResolver: LinkResolver
}

export const usePrismicPreviewResolver = (
  repositoryName: string,
  config: UsePrismicPreviewResolverConfig,
): readonly [UsePrismicPreviewResolverState, UsePrismicPreviewResolverFn] => {
  const [state] = usePrismicPreviewContext(repositoryName)
  const [localState, localDispatch] = React.useReducer(
    localReducer,
    initialLocalState,
  )

  const resolvePreview = React.useCallback(async (): Promise<void> => {
    pipe(
      await RTE.run(usePrismicPreviewResolverProgram, {
        repositoryName,
        beginResolving: () =>
          localDispatch({
            type: UsePrismicPreviewResolverActionType.BeginResolving,
          }),
        resolved: (path) => () =>
          localDispatch({
            type: UsePrismicPreviewResolverActionType.Resolved,
            payload: path,
          }),
        linkResolver: config.linkResolver,
        apiEndpoint: state.pluginOptions.apiEndpoint,
        accessToken: state.pluginOptions.accessToken,
      }),
      E.fold(
        (error) =>
          localDispatch({
            type: UsePrismicPreviewResolverActionType.Fail,
            payload: error,
          }),
        constVoid,
      ),
    )
  }, [])

  return React.useMemo(() => [localState, resolvePreview] as const, [
    localState,
    resolvePreview,
  ])
}

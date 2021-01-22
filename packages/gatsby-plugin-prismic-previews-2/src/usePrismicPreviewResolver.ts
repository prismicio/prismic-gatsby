import * as React from 'react'
import * as gatsby from 'gatsby'
import * as cookie from 'es-cookie'
import * as RTE from 'fp-ts/ReaderTaskEither'
import * as TE from 'fp-ts/TaskEither'
import * as E from 'fp-ts/Either'
import { constVoid, pipe } from 'fp-ts/function'
import Prismic from 'prismic-javascript'

import { getURLSearchParam } from './lib/getURLSearchParam'
import { createClient, CreateClientEnv } from './lib/createClient'
import { UnauthorizedError } from './errors/NotAuthorizedError'

import { LinkResolver, PrismicAPIDocument } from './types'
import { usePrismicPreviewContext } from './usePrismicPreviewContext'
import { validatePreviewTokenForRepository } from './lib/isPreviewTokenForRepository'

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
  beginResolving(): void
  resolved(path: string): void
  linkResolver(doc: PrismicAPIDocument): string
  shouldAutoRedirect: boolean
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
  RTE.chainFirst((env) =>
    RTE.fromEither(
      validatePreviewTokenForRepository(env.repositoryName, env.token),
    ),
  ),
  RTE.bindW('documentId', () =>
    pipe(
      getURLSearchParam('token'),
      RTE.fromOption(() => new Error('documentId URL parameter not present')),
    ),
  ),
  RTE.chainFirst((env) =>
    RTE.fromIO(() => cookie.set(Prismic.previewCookie, env.token)),
  ),
  RTE.bindW('client', () => createClient),
  RTE.bind('pathResolver', (env) =>
    RTE.of(env.client.getPreviewResolver(env.token, env.documentId)),
  ),
  RTE.chainFirst((env) => RTE.fromIO(env.beginResolving)),
  RTE.bind('path', (env) =>
    RTE.fromTaskEither(
      TE.tryCatch(
        () => env.pathResolver.resolve(env.linkResolver, '/'),
        (error) =>
          error instanceof Error && /401/.test(error.message)
            ? new UnauthorizedError()
            : (error as Error),
      ),
    ),
  ),
  RTE.chainFirst((env) => RTE.fromIO(() => env.resolved(env.path))),
  RTE.chainFirst((env) =>
    RTE.fromIO(() => env.shouldAutoRedirect && gatsby.navigate(env.path)),
  ),
  RTE.map(constVoid),
)

export type UsePrismicPreviewResolverConfig = {
  linkResolver: LinkResolver
  shouldAutoRedirect?: boolean
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
        resolved: (path) =>
          localDispatch({
            type: UsePrismicPreviewResolverActionType.Resolved,
            payload: path,
          }),
        linkResolver: config.linkResolver,
        apiEndpoint: state.pluginOptions.apiEndpoint,
        accessToken: state.pluginOptions.accessToken,
        shouldAutoRedirect: config.shouldAutoRedirect ?? false,
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

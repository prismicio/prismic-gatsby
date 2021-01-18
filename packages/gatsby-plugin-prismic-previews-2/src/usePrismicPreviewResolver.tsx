import * as React from 'react'
import * as gatsby from 'gatsby'
import * as cookie from 'es-cookie'
import * as RTE from 'fp-ts/ReaderTaskEither'
import * as TE from 'fp-ts/TaskEither'
import * as E from 'fp-ts/Either'
import { constVoid, pipe } from 'fp-ts/function'
import Prismic from 'prismic-javascript'

import { LinkResolver, PrismicAPIDocument } from './types'
import { usePrismicPreviewContext } from './usePrismicPreviewContext'
import { getURLSearchParam } from './lib/getURLSearchParam'
import { createClient, CreateClientEnv } from './lib/createClient'
import { UnauthorizedError } from './errors/NotAuthorizedError'

interface LocalState {
  state: 'INIT' | 'RESOLVING' | 'RESOLVED' | 'FAILED';
  document?: PrismicAPIDocument;
  path?: string;
  error?: Error;
}

enum LocalActionType {
  BeginResolving = 'BeginResolving',
  Resolved = 'Resolved',
  Fail = 'Fail',
}

type LocalAction =
  | {
      type: LocalActionType.BeginResolving;
    }
  | {
      type: LocalActionType.Resolved;
      payload: string;
    }
  | {
      type: LocalActionType.Fail;
      payload: Error;
    }

const initialLocalState: LocalState = {
  state: 'INIT',
  document: undefined,
  path: undefined,
}

const localReducer = (state: LocalState, action: LocalAction): LocalState => {
  switch (action.type) {
    case LocalActionType.BeginResolving: {
      return {
        ...initialLocalState,
        state: 'RESOLVING',
      }
    }

    case LocalActionType.Resolved: {
      return {
        ...state,
        state: 'RESOLVED',
        path: action.payload,
      }
    }

    case LocalActionType.Fail: {
      return {
        ...initialLocalState,
        state: 'FAILED',
        error: action.payload,
      }
    }
  }
}

interface UsePrismicPreviewResolverProgramEnv extends CreateClientEnv {
  beginResolving(): void;
  resolved(path: string): void;
  linkResolver(doc: PrismicAPIDocument): string;
  shouldAutoRedirect: boolean;
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
  linkResolver: LinkResolver;
  shouldAutoRedirect?: boolean;
}

export const usePrismicPreviewResolver = (
  repositoryName: string,
  config: UsePrismicPreviewResolverConfig,
): LocalState => {
  const [localState, localDispatch] = React.useReducer(
    localReducer,
    initialLocalState,
  )
  const [state] = usePrismicPreviewContext(repositoryName)

  React.useEffect(() => {
    const asyncEffect = async (): Promise<void> => {
      pipe(
        await RTE.run(usePrismicPreviewResolverProgram, {
          beginResolving: () =>
            localDispatch({ type: LocalActionType.BeginResolving }),
          resolved: (path) =>
            localDispatch({ type: LocalActionType.Resolved, payload: path }),
          linkResolver: config.linkResolver,
          apiEndpoint: state.pluginOptions.apiEndpoint,
          accessToken: state.pluginOptions.accessToken,
          shouldAutoRedirect: config.shouldAutoRedirect ?? false,
        }),
        E.fold(
          (error) =>
            localDispatch({ type: LocalActionType.Fail, payload: error }),
          constVoid,
        ),
      )
    }

    asyncEffect()
  }, [])

  return localState
}

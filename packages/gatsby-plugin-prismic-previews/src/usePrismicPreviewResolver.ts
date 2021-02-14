import * as React from 'react'
import * as prismic from 'ts-prismic'
import * as RTE from 'fp-ts/ReaderTaskEither'
import * as TE from 'fp-ts/TaskEither'
import * as E from 'fp-ts/Either'
import * as A from 'fp-ts/Array'
import * as IO from 'fp-ts/IO'
import { constVoid, pipe } from 'fp-ts/function'
import axios from 'redaxios'

import { BuildQueryParamsEnv, buildQueryParams } from './lib/buildQueryParams'
import { getCookie } from './lib/getCookie'
import { getURLSearchParam } from './lib/getURLSearchParam'
// import { validatePreviewTokenForRepository } from './lib/isPreviewTokenForRepository'

import { LinkResolver } from './types'
import { usePrismicPreviewContext } from './usePrismicPreviewContext'

export type UsePrismicPreviewResolverFn = () => Promise<void>

export interface UsePrismicPreviewResolverState {
  state: 'INIT' | 'RESOLVING' | 'RESOLVED' | 'FAILED'
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

interface UsePrismicPreviewResolverProgramEnv extends BuildQueryParamsEnv {
  apiEndpoint: string
  accessToken?: string
  repositoryName: string
  beginResolving: IO.IO<void>
  resolved(path: string): IO.IO<void>
  linkResolver: LinkResolver
}

const usePrismicPreviewResolverProgram: RTE.ReaderTaskEither<
  UsePrismicPreviewResolverProgramEnv,
  Error,
  void
> = pipe(
  RTE.ask<UsePrismicPreviewResolverProgramEnv>(),

  RTE.bindW('documentId', () =>
    pipe(
      getURLSearchParam('documentId'),
      RTE.fromOption(() => new Error('documentId URL parameter not present')),
    ),
  ),

  // Only continue if this is a preview session, which is determined by the
  // presence of the Prismic preview cookie.
  RTE.bindW('token', () =>
    pipe(
      RTE.fromIOEither(getCookie(prismic.cookie.preview)),
      RTE.mapLeft(
        () => new Error('Not a preview session. No preview cookie detected.'),
      ),
    ),
  ),

  // TODO: Support new style ref in addition to old URL style:
  //
  // {%22_tracker%22:%22gjrM9Kx7%22%2C%22gatsby-source-prismic-v4.prismic.io%22:{%22preview%22:%22https://gatsby-source-prismic-v4.prismic.io/previews/YCiXchUAACMAxgIi?websitePreviewId=YCig0BUAACYAxiu-%22}}
  //
  // // Only continue if this preview session is for this repository.
  // RTE.chainFirst((env) =>
  //   RTE.fromEither(
  //     validatePreviewTokenForRepository(env.repositoryName, env.token),
  //   ),
  // ),

  // Start resolving.
  RTE.chainFirst((env) => RTE.fromIO(env.beginResolving)),

  RTE.bindW('params', () => buildQueryParams),
  RTE.bind('url', (env) =>
    RTE.of(
      prismic.buildQueryURL(
        env.apiEndpoint,
        env.token,
        prismic.predicate.at('document.id', env.documentId),
        env.params,
      ),
    ),
  ),
  RTE.bind('res', (env) =>
    RTE.fromTaskEither(
      TE.tryCatch(
        async () => (await axios(env.url)).data as prismic.Response.Query,
        (error) => error as Error,
      ),
    ),
  ),
  RTE.bindW('document', (env) =>
    pipe(
      A.head(env.res.results),
      RTE.fromOption(() => new Error('Document could not be found.')),
    ),
  ),
  RTE.bind('path', (env) => RTE.of(env.linkResolver(env.document))),

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
        graphQuery: state.pluginOptions.graphQuery,
        fetchLinks: state.pluginOptions.fetchLinks,
        lang: state.pluginOptions.lang,
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
  }, [
    repositoryName,
    config.linkResolver,
    state.pluginOptions.accessToken,
    state.pluginOptions.apiEndpoint,
    state.pluginOptions.graphQuery,
    state.pluginOptions.fetchLinks,
    state.pluginOptions.lang,
  ])

  return React.useMemo(() => [localState, resolvePreview] as const, [
    localState,
    resolvePreview,
  ])
}

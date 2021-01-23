import * as React from 'react'
import * as RTE from 'fp-ts/ReaderTaskEither'
import * as E from 'fp-ts/Either'
import * as IO from 'fp-ts/IO'
import * as A from 'fp-ts/Array'
import { constVoid, pipe } from 'fp-ts/function'
import { createNodeHelpers } from 'gatsby-node-helpers'
import { GLOBAL_TYPE_PREFIX } from 'gatsby-source-prismic'
import Prismic from 'prismic-javascript'
import md5 from 'tiny-hashes/md5'

import { getCookie } from './lib/getCookie'
import { validatePreviewTokenForRepository } from './lib/isPreviewTokenForRepository'
import {
  queryAllDocuments,
  QueryAllDocumentsEnv,
} from './lib/queryAllDocuments'

import { PrismicAPIDocumentNodeInput, UnknownRecord } from './types'
import { PrismicContextActionType } from './context'
import { usePrismicPreviewContext } from './usePrismicPreviewContext'

export type UsePrismicPreviewBootstrapFn = () => void

export interface UsePrismicPreviewBootstrapState {
  state: 'INIT' | 'BOOTSTRAPPING' | 'BOOTSTRAPPED' | 'FAILED'
  error?: Error
}

enum UsePrismicPreviewBootstrapActionType {
  BeginBootstrapping = 'BeginBootstrapping',
  Bootstrapped = 'Resolved',
  Fail = 'Fail',
}

type UsePrismicPreviewBootstrapAction =
  | {
      type: UsePrismicPreviewBootstrapActionType.BeginBootstrapping
    }
  | {
      type: UsePrismicPreviewBootstrapActionType.Bootstrapped
    }
  | {
      type: UsePrismicPreviewBootstrapActionType.Fail
      payload: Error
    }

const initialLocalState: UsePrismicPreviewBootstrapState = {
  state: 'INIT',
}

const localReducer = (
  state: UsePrismicPreviewBootstrapState,
  action: UsePrismicPreviewBootstrapAction,
): UsePrismicPreviewBootstrapState => {
  switch (action.type) {
    case UsePrismicPreviewBootstrapActionType.BeginBootstrapping: {
      return {
        ...initialLocalState,
        state: 'BOOTSTRAPPING',
      }
    }

    case UsePrismicPreviewBootstrapActionType.Bootstrapped: {
      return {
        ...state,
        state: 'BOOTSTRAPPED',
      }
    }

    case UsePrismicPreviewBootstrapActionType.Fail: {
      return {
        ...initialLocalState,
        state: 'FAILED',
        error: action.payload,
      }
    }
  }
}

interface UsePrismicPreviewBootstrapProgramEnv extends QueryAllDocumentsEnv {
  repositoryName: string
  typePrefix: string | undefined
  isBootstrapped: boolean
  beginBootstrapping: IO.IO<void>
  bootstrapped: IO.IO<void>
  appendNodes(nodes: PrismicAPIDocumentNodeInput[]): IO.IO<void>
  createNodeId(input: string): string
  createContentDigest(input: string | UnknownRecord): string
}

const usePrismicPreviewBootstrapProgram: RTE.ReaderTaskEither<
  UsePrismicPreviewBootstrapProgramEnv,
  Error,
  void
> = pipe(
  RTE.ask<UsePrismicPreviewBootstrapProgramEnv>(),

  // Only continue if this is a preview session, which is determined by the
  // presence of the Prismic preview cookie.
  RTE.bindW('token', () =>
    pipe(
      RTE.fromIOEither(getCookie(Prismic.previewCookie)),
      RTE.mapLeft(
        () => new Error('Not a preview session. No preview cookie detected.'),
      ),
    ),
  ),

  // Only continue if this preview session is for this repository.
  RTE.chainFirstW((env) =>
    RTE.fromEither(
      validatePreviewTokenForRepository(env.repositoryName, env.token),
    ),
  ),

  // TODO: wrap these errors in the reporter format
  // Only bootstrap once.
  RTE.chainW(
    RTE.fromPredicate(
      (env) => !env.isBootstrapped,
      (env) =>
        new Error(
          `Cannot bootstrap a repository that has already been bootstrapped: ${env.repositoryName}`,
        ),
    ),
  ),

  // Start bootstrap.
  RTE.chainFirst((env) => RTE.fromIO(env.beginBootstrapping)),

  RTE.bind('nodeHelpers', (env) =>
    RTE.of(
      // These node helpers must match node helpers from `gatsby-source-prismic`.
      createNodeHelpers({
        typePrefix: [GLOBAL_TYPE_PREFIX, env.typePrefix]
          .filter(Boolean)
          .join(' '),
        fieldPrefix: GLOBAL_TYPE_PREFIX,
        createNodeId: env.createNodeId,
        createContentDigest: env.createContentDigest,
      }),
    ),
  ),
  RTE.bindW('nodes', (env) =>
    pipe(
      queryAllDocuments,
      RTE.map(
        A.map(
          (doc) =>
            env.nodeHelpers.createNodeFactory(doc.type)(
              doc,
            ) as PrismicAPIDocumentNodeInput,
        ),
      ),
    ),
  ),
  RTE.chainFirst((env) => RTE.fromIO(env.appendNodes(env.nodes))),

  // End bootstrap.
  RTE.chainFirst((env) => RTE.fromIO(env.bootstrapped)),

  RTE.map(constVoid),
)

export const usePrismicPreviewBootstrap = (
  repositoryName: string,
): readonly [UsePrismicPreviewBootstrapState, UsePrismicPreviewBootstrapFn] => {
  const [contextState, contextDispatch] = usePrismicPreviewContext(
    repositoryName,
  )
  const [localState, localDispatch] = React.useReducer(
    localReducer,
    initialLocalState,
  )

  const resolvePreview = React.useCallback(async (): Promise<void> => {
    pipe(
      await RTE.run(usePrismicPreviewBootstrapProgram, {
        repositoryName,
        beginBootstrapping: () =>
          localDispatch({
            type: UsePrismicPreviewBootstrapActionType.BeginBootstrapping,
          }),
        bootstrapped: () =>
          localDispatch({
            type: UsePrismicPreviewBootstrapActionType.Bootstrapped,
          }),
        appendNodes: (nodes: PrismicAPIDocumentNodeInput[]) => () =>
          contextDispatch({
            type: PrismicContextActionType.AppendNodes,
            payload: nodes,
          }),
        isBootstrapped: contextState.isBootstrapped,
        apiEndpoint: contextState.pluginOptions.apiEndpoint,
        typePrefix: contextState.pluginOptions.typePrefix,
        graphQuery: contextState.pluginOptions.graphQuery,
        fetchLinks: contextState.pluginOptions.fetchLinks,
        lang: contextState.pluginOptions.lang,
        createNodeId: (input: string) => md5(input),
        createContentDigest: (input: string | UnknownRecord) =>
          md5(JSON.stringify(input)),
      }),
      E.fold(
        (error) =>
          localDispatch({
            type: UsePrismicPreviewBootstrapActionType.Fail,
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

import * as React from 'react'
import * as prismic from 'ts-prismic'
import * as RTE from 'fp-ts/ReaderTaskEither'
import * as RE from 'fp-ts/ReaderEither'
import * as E from 'fp-ts/Either'
import * as IO from 'fp-ts/IO'
import * as A from 'fp-ts/Array'
import { constVoid, pipe } from 'fp-ts/function'
import { createNodeHelpers } from 'gatsby-node-helpers'
import { GLOBAL_TYPE_PREFIX } from 'gatsby-source-prismic'
import * as gatsbyPrismic from 'gatsby-source-prismic'
import md5 from 'tiny-hashes/md5'

import { BuildTypePathsStoreFilenameEnv } from './lib/buildTypePathsStoreFilename'
import { fetchTypePathsStore } from './lib/fetchTypePaths'
import { getCookie } from './lib/getCookie'
import { proxyDocumentNodeInput } from './lib/proxyDocumentNodeInput'
import {
  queryAllDocuments,
  QueryAllDocumentsEnv,
} from './lib/queryAllDocuments'
import { serializePath } from './lib/serializePath'
import { validatePreviewRefForRepository } from './lib/validatePreviewRefForRepository'

import {
  HTMLSerializer,
  LinkResolver,
  PluginOptions,
  PrismicAPIDocumentNodeInput,
  TypePathsStore,
  UnknownRecord,
} from './types'
import { PrismicContextActionType } from './context'
import { usePrismicPreviewContext } from './usePrismicPreviewContext'

export type UsePrismicPreviewBootstrapFn = () => void

export interface UsePrismicPreviewBootstrapState {
  state: 'INIT' | 'BOOTSTRAPPING' | 'BOOTSTRAPPED' | 'FAILED'
  error?: Error
}

enum UsePrismicPreviewBootstrapActionType {
  BeginBootstrapping = 'BeginBootstrapping',
  Bootstrapped = 'Bootstrapped',
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

const buildInitialLocalState = (
  isBootstrapped: boolean,
): UsePrismicPreviewBootstrapState => ({
  state: isBootstrapped ? 'BOOTSTRAPPED' : 'INIT',
})

const localReducer = (
  _: UsePrismicPreviewBootstrapState,
  action: UsePrismicPreviewBootstrapAction,
): UsePrismicPreviewBootstrapState => {
  switch (action.type) {
    case UsePrismicPreviewBootstrapActionType.BeginBootstrapping: {
      return {
        state: 'BOOTSTRAPPING',
      }
    }

    case UsePrismicPreviewBootstrapActionType.Bootstrapped: {
      return {
        state: 'BOOTSTRAPPED',
      }
    }

    case UsePrismicPreviewBootstrapActionType.Fail: {
      return {
        state: 'FAILED',
        error: action.payload,
      }
    }
  }
}

interface UsePrismicPreviewBootstrapProgramEnv
  extends QueryAllDocumentsEnv,
    BuildTypePathsStoreFilenameEnv {
  repositoryName: string
  typePrefix: string | undefined
  isBootstrapped: boolean
  beginBootstrapping: IO.IO<void>
  bootstrapped: IO.IO<void>
  appendNodes(nodes: unknown[]): IO.IO<void>
  appendTypePaths(typePathsStore: TypePathsStore): IO.IO<void>
  createNodeId(input: string): string
  createContentDigest(input: string | UnknownRecord): string

  // Proxify node env
  getNode(id: string): PrismicAPIDocumentNodeInput | undefined
  getTypePath(path: string[]): gatsbyPrismic.PrismicTypePathType
  linkResolver: LinkResolver
  htmlSerializer?: HTMLSerializer
  imageImgixParams: PluginOptions['imageImgixParams']
  imagePlaceholderImgixParams: PluginOptions['imagePlaceholderImgixParams']
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
      RTE.fromIOEither(getCookie(prismic.cookie.preview)),
      RTE.mapLeft(() => new Error('preview cookie not present')),
    ),
  ),

  // Only continue if this preview session is for this repository.
  RTE.chainFirstW((env) =>
    RTE.fromEither(
      validatePreviewRefForRepository(env.repositoryName, env.token),
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

  RTE.bindW('typePathsStore', () => fetchTypePathsStore),
  RTE.chainFirst((env) => RTE.fromIO(env.appendTypePaths(env.typePathsStore))),
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
      RTE.map(A.map(proxyDocumentNodeInput)),
      RTE.map(A.sequence(RE.readerEither)),
      RTE.chainW(RTE.fromReaderEither),
    ),
  ),
  RTE.chainFirst((env) => RTE.fromIO(env.appendNodes(env.nodes))),

  // End bootstrap.
  RTE.chainFirst((env) => RTE.fromIO(env.bootstrapped)),

  RTE.map(constVoid),
)

export type UsePrismicPreviewBootstrapConfig = {
  linkResolver: LinkResolver
  htmlSerializer?: HTMLSerializer
}

export const usePrismicPreviewBootstrap = (
  repositoryName: string,
  config: UsePrismicPreviewBootstrapConfig,
): readonly [UsePrismicPreviewBootstrapState, UsePrismicPreviewBootstrapFn] => {
  const [contextState, contextDispatch] = usePrismicPreviewContext(
    repositoryName,
  )
  const [localState, localDispatch] = React.useReducer(
    localReducer,
    contextState.isBootstrapped,
    buildInitialLocalState,
  )

  const bootstrapPreview = React.useCallback(async (): Promise<void> => {
    pipe(
      await RTE.run(usePrismicPreviewBootstrapProgram, {
        repositoryName,
        accessToken: contextState.pluginOptions.accessToken,
        beginBootstrapping: () =>
          localDispatch({
            type: UsePrismicPreviewBootstrapActionType.BeginBootstrapping,
          }),
        // TODO: Remove local bootstrapped state? We already have it in context.
        bootstrapped: () => {
          localDispatch({
            type: UsePrismicPreviewBootstrapActionType.Bootstrapped,
          })
          contextDispatch({
            type: PrismicContextActionType.Bootstrapped,
          })
        },
        appendNodes: (nodes: unknown[]) => () =>
          contextDispatch({
            type: PrismicContextActionType.AppendNodes,
            payload: nodes,
          }),
        appendTypePaths: (typePathsStore: TypePathsStore) => () =>
          contextDispatch({
            type: PrismicContextActionType.AppendTypePaths,
            payload: typePathsStore,
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
        getNode: (id: string) => contextState.nodes[id],
        getTypePath: (path: string[]) =>
          contextState.typePaths[serializePath(path)],
        linkResolver: config.linkResolver,
        htmlSerializer: config.htmlSerializer,
        imageImgixParams: contextState.pluginOptions.imageImgixParams,
        imagePlaceholderImgixParams:
          contextState.pluginOptions.imagePlaceholderImgixParams,
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
  }, [
    repositoryName,
    config.linkResolver,
    config.htmlSerializer,
    contextState,
    contextDispatch,
  ])

  return React.useMemo(() => [localState, bootstrapPreview] as const, [
    localState,
    bootstrapPreview,
  ])
}

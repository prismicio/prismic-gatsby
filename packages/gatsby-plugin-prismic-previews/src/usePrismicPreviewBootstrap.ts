import * as React from 'react'
import * as prismic from 'ts-prismic'
import * as RTE from 'fp-ts/ReaderTaskEither'
import * as RE from 'fp-ts/ReaderEither'
import * as TE from 'fp-ts/TaskEither'
import * as T from 'fp-ts/Task'
import * as IO from 'fp-ts/IO'
import * as A from 'fp-ts/Array'
import * as R from 'fp-ts/Record'
import { constVoid, pipe } from 'fp-ts/function'
import { createNodeHelpers } from 'gatsby-node-helpers'
import { GLOBAL_TYPE_PREFIX, PrismicTypePathType } from 'gatsby-source-prismic'
import md5 from 'tiny-hashes/md5'

import { extractPreviewRefRepositoryName } from './lib/extractPreviewRefRepositoryName'
import { fetchTypePaths } from './lib/fetchTypePaths'
import { getCookie } from './lib/getCookie'
import { isPreviewSession } from './lib/isPreviewSession'
import { proxyDocumentNodeInput } from './lib/proxyDocumentNodeInput'
import { queryAllDocuments } from './lib/queryAllDocuments'
import { serializePath } from './lib/serializePath'

import {
  Mutable,
  PrismicAPIDocumentNodeInput,
  PrismicRepositoryConfigs,
  TypePathsStore,
  UnknownRecord,
} from './types'
import { PrismicContextActionType, PrismicContextState } from './context'
import { usePrismicPreviewContext } from './usePrismicPreviewContext'
import { defaultFieldTransformer } from './lib/defaultFieldTransformer'

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

interface UsePrismicPreviewBootstrapProgramEnv {
  isBootstrapped: boolean
  setActiveRepositoryName(repositoryName: string): IO.IO<void>
  beginBootstrapping: IO.IO<void>
  bootstrapped: IO.IO<void>
  appendNodes(nodes: unknown[]): IO.IO<void>
  appendTypePaths(
    repositoryName: string,
    typePaths: TypePathsStore,
  ): IO.IO<void>

  createNodeId(input: string): string
  createContentDigest(input: string | UnknownRecord): string

  pluginOptionsStore: PrismicContextState['pluginOptionsStore']
  repositoryConfigs: PrismicRepositoryConfigs

  // Proxify node env
  getNode(id: string): PrismicAPIDocumentNodeInput | undefined
  getTypePath(
    repositoryName: string,
    path: string[],
  ): PrismicTypePathType | undefined
}

const previewBootstrapProgram: RTE.ReaderTaskEither<
  UsePrismicPreviewBootstrapProgramEnv,
  Error,
  void
> = pipe(
  RTE.ask<UsePrismicPreviewBootstrapProgramEnv>(),

  // Only continue if this is a preview session.
  RTE.chainFirst(() => RTE.fromIOEither(isPreviewSession)),

  RTE.bindW('previewRef', () =>
    pipe(
      RTE.fromIOEither(getCookie(prismic.cookie.preview)),
      RTE.mapLeft(() => new Error('preview cookie not present')),
    ),
  ),

  RTE.bindW('repositoryName', (env) =>
    pipe(
      env.previewRef,
      extractPreviewRefRepositoryName,
      RTE.fromOption(() => new Error('Invalid preview ref')),
    ),
  ),

  RTE.chainFirst((env) =>
    RTE.fromIO(env.setActiveRepositoryName(env.repositoryName)),
  ),

  RTE.bindW('repositoryConfig', (env) =>
    pipe(
      env.repositoryConfigs,
      A.findFirst((config) => config.repositoryName === env.repositoryName),
      RTE.fromOption(
        () =>
          new Error(
            `A configuration object could not be found for repository "${env.repositoryName}". Check that the repository is configured in your app's usePrismicPreviewResolver.`,
          ),
      ),
    ),
  ),

  RTE.bindW('repositoryPluginOptions', (env) =>
    pipe(
      env.pluginOptionsStore,
      R.lookup(env.repositoryName),
      RTE.fromOption(
        () =>
          new Error(
            `Plugin options could not be found for repository "${env.repositoryName}". Check that the repository is configured in your app's gatsby-config.js`,
          ),
      ),
    ),
  ),

  RTE.bind('nodeHelpers', (env) =>
    RTE.right(
      createNodeHelpers({
        typePrefix: [GLOBAL_TYPE_PREFIX, env.repositoryPluginOptions.typePrefix]
          .filter(Boolean)
          .join(' '),
        fieldPrefix: GLOBAL_TYPE_PREFIX,
        createNodeId: env.createNodeId,
        createContentDigest: env.createContentDigest,
      }),
    ),
  ),

  // TODO: wrap these errors in the reporter format
  // Only bootstrap once.
  RTE.chainW(
    RTE.fromPredicate(
      (env) => !env.isBootstrapped,
      () =>
        new Error(
          `The Prismic preview has already been bootstrapped and cannot happen again.`,
        ),
    ),
  ),

  // Start bootstrap.
  RTE.chainFirst((env) => RTE.fromIO(env.beginBootstrapping)),

  RTE.bindW('typePaths', (env) => () =>
    fetchTypePaths({ repositoryName: env.repositoryName }),
  ),
  RTE.chainFirst((env) =>
    RTE.fromIO(env.appendTypePaths(env.repositoryName, env.typePaths)),
  ),

  RTE.bindW('nodes', (env) =>
    pipe(
      () =>
        queryAllDocuments({
          apiEndpoint: env.repositoryPluginOptions.apiEndpoint,
          lang: env.repositoryPluginOptions.lang,
          fetchLinks: env.repositoryPluginOptions.fetchLinks,
          graphQuery: env.repositoryPluginOptions.graphQuery,
          accessToken: env.repositoryPluginOptions.accessToken,
        }),
      RTE.map(
        A.map(
          (doc) =>
            env.nodeHelpers.createNodeFactory(doc.type)(
              doc,
            ) as PrismicAPIDocumentNodeInput,
        ),
      ),
      RTE.map(
        A.map((doc) => () =>
          proxyDocumentNodeInput(doc)({
            createContentDigest: env.createContentDigest,
            nodeHelpers: env.nodeHelpers,
            linkResolver: env.repositoryConfig.linkResolver,
            getTypePath: (path) => env.getTypePath(env.repositoryName, path),
            getNode: env.getNode,
            imageImgixParams: env.repositoryPluginOptions.imageImgixParams,
            imagePlaceholderImgixParams:
              env.repositoryPluginOptions.imagePlaceholderImgixParams,
            htmlSerializer: env.repositoryConfig.htmlSerializer,
            transformFieldName:
              env.repositoryConfig.transformFieldName ??
              defaultFieldTransformer,
          }),
        ),
      ),
      RTE.map(RE.sequenceArray),
      RTE.chainW(RTE.fromReaderEither),
    ),
  ),
  RTE.chainFirst((env) =>
    RTE.fromIO(env.appendNodes(env.nodes as Mutable<typeof env.nodes>)),
  ),

  // End bootstrap.
  RTE.chainFirst((env) => RTE.fromIO(env.bootstrapped)),

  RTE.map(constVoid),
)

/**
 * React hook that bootstraps a Prismic preview session. When the returned
 * bootstrap function is called, the preiew session will be scoped to this
 * hook's Prismic repository. All documents from the repository will be fetched
 * using the preview session's documents.
 *
 * @param repositoryConfigs Configuration that determines how the bootstrap function runs.
 */
export const usePrismicPreviewBootstrap = (
  repositoryConfigs: PrismicRepositoryConfigs,
): readonly [UsePrismicPreviewBootstrapState, UsePrismicPreviewBootstrapFn] => {
  // A ref to the latest contextState is setup specifically for getTypePath
  // which is populated during the program's runtime. Since
  // contextState.typePaths is empty at all times during the program's run due
  // to closures, we need to opt out of the closure and use a ref.
  //
  // If you have a better idea how to handle this, please share!
  const contextStateRef = React.useRef<PrismicContextState>()

  const [contextState, contextDispatch] = usePrismicPreviewContext()
  const [localState, localDispatch] = React.useReducer(
    localReducer,
    contextState.isBootstrapped,
    buildInitialLocalState,
  )

  // We need to update the ref anytime contextState changes to ensure lazy
  // functions get the latest data.
  React.useEffect(() => {
    contextStateRef.current = contextState
  }, [contextState])

  const bootstrapPreview = React.useCallback(async (): Promise<void> => {
    await pipe(
      previewBootstrapProgram({
        setActiveRepositoryName: (repositoryName: string) => () =>
          contextDispatch({
            type: PrismicContextActionType.SetActiveRepositoryName,
            payload: { repositoryName },
          }),
        beginBootstrapping: () =>
          localDispatch({
            type: UsePrismicPreviewBootstrapActionType.BeginBootstrapping,
          }),
        // TODO: Remove local bootstrapped state? We already have it in context.
        bootstrapped: () => {
          contextDispatch({
            type: PrismicContextActionType.Bootstrapped,
          })
          localDispatch({
            type: UsePrismicPreviewBootstrapActionType.Bootstrapped,
          })
        },
        appendNodes: (nodes: unknown[]) => () =>
          contextDispatch({
            type: PrismicContextActionType.AppendNodes,
            payload: { nodes },
          }),
        appendTypePaths: (
          repositoryName: string,
          typePaths: TypePathsStore,
        ) => () =>
          contextDispatch({
            type: PrismicContextActionType.AppendTypePaths,
            payload: { repositoryName, typePaths },
          }),
        isBootstrapped: contextState.isBootstrapped,
        pluginOptionsStore: contextState.pluginOptionsStore,
        repositoryConfigs,
        // We use the ref to ensure we can access nodes populated during the
        // same run that the population occurs. This means we don't need to wait
        // for the next render to access nodes.
        getNode: (id: string) => contextStateRef.current?.nodes[id],
        // We use the ref to ensure we can access type paths populated during the
        // same run that the population occurs. This means we don't need to wait
        // for the next render to access type paths.
        getTypePath: (repositoryName: string, path: string[]) =>
          contextStateRef.current?.typePathsStore[repositoryName][
            serializePath(path)
          ],
        createNodeId: (input: string) => md5(input),
        createContentDigest: (input: string | UnknownRecord) =>
          md5(JSON.stringify(input)),
      }),
      TE.fold(
        (error) =>
          T.fromIO(() =>
            localDispatch({
              type: UsePrismicPreviewBootstrapActionType.Fail,
              payload: error,
            }),
          ),
        () => T.of(void 0),
      ),
    )()
  }, [
    repositoryConfigs,
    contextState.pluginOptionsStore,
    contextState.isBootstrapped,
    contextDispatch,
  ])

  return React.useMemo(() => [localState, bootstrapPreview] as const, [
    localState,
    bootstrapPreview,
  ])
}

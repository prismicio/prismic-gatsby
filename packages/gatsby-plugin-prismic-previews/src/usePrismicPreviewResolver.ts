import * as React from 'react'
import * as gatsby from 'gatsby'
import * as cookie from 'es-cookie'
import * as RTE from 'fp-ts/ReaderTaskEither'
import { pipe } from 'fp-ts/function'
import Prismic from 'prismic-javascript'
import { Document as PrismicAPIDocument } from 'prismic-javascript/types/documents'
import { createClient, Dependencies, queryById } from 'gatsby-prismic-core'

import { getURLSearchParam } from './lib/getURLSearchParam'
import { buildDependencies } from './buildDependencies'
import {
  PrismicContextAction,
  PrismicContextActionType,
  usePrismicContext,
} from './usePrismicContext'

interface PrismicPreviewProgramDependencies {
  contextDispatch: (action: PrismicContextAction) => void
}

const createRootNodeRelationship = (
  path: string,
  nodeId: string,
): RTE.ReaderTaskEither<PrismicPreviewProgramDependencies, never, void> =>
  RTE.asks((deps) =>
    deps.contextDispatch({
      type: PrismicContextActionType.CreateRootNodeRelationship,
      payload: { path, nodeId },
    }),
  )

const prismicPreviewResolverProgram = pipe(
  RTE.ask<PrismicPreviewProgramDependencies & Dependencies>(),
  RTE.bindW('previewRef', () =>
    pipe(
      getURLSearchParam('token'),
      RTE.fromOption(() => Error('token URL parameter not present')),
    ),
  ),
  RTE.chainFirst((scope) =>
    RTE.of(cookie.set(Prismic.previewCookie, scope.previewRef)),
  ),
  RTE.bindW('documentId', () =>
    pipe(
      getURLSearchParam('documentId'),
      RTE.fromOption(() => Error('documentId URL parameter not present')),
    ),
  ),
  RTE.bindW('client', createClient),
  RTE.bindW('document', (scope) =>
    pipe(
      queryById(scope.client, scope.documentId, {
        fetchLinks: scope.pluginOptions.fetchLinks,
        lang: scope.pluginOptions.lang,
      }),
      (t) => RTE.fromTask<Dependencies, Error, PrismicAPIDocument>(t),
    ),
  ),
  RTE.bindW('path', (scope) =>
    pipe(
      scope.pluginOptions.linkResolver?.()?.(scope.document),
      RTE.fromPredicate(
        (path) => path != null,
        () =>
          Error(
            'linkResolver did not resolve to a path for the previewed document',
          ),
      ),
    ),
  ),
  RTE.chainFirstW((scope) =>
    createRootNodeRelationship(scope.path, scope.document.id),
  ),
  // TODO: Replace this map with something more side-effect-y
  RTE.map((scope) => gatsby.navigate(scope.path)),
)

export type UsePrismicPreviewResolverConfig = {
  repositoryName: string
}

export const usePrismicPreviewResolver = (
  config: UsePrismicPreviewResolverConfig,
): void => {
  const [contextState, contextDispatch] = usePrismicContext()

  React.useEffect(() => {
    const pluginOptions = contextState.pluginOptionsMap[config.repositoryName]
    if (!pluginOptions)
      throw Error(
        `usePrismicPreviewResolver was configured to use a repository with the name "${config.repositoryName}" but was not registered in the top-level PrismicProvider component. Please check your repository name and/or PrismicProvider props.`,
      )

    const dependencies = {
      ...buildDependencies(contextDispatch, pluginOptions),
      contextDispatch,
    }

    RTE.run(prismicPreviewResolverProgram, dependencies)
  }, [config.repositoryName, contextState.pluginOptionsMap, contextDispatch])
}

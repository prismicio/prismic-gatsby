import * as RTE from 'fp-ts/ReaderTaskEither'
import { pipe } from 'fp-ts/function'

import {
  Dependencies,
  PrismicClient,
  PrismicClientQueryOptions,
} from '../types'

import { getRef } from './getRef'

/**
 * Build a query options argument for a Prismic client using the environment's
 * plugin options and state. If options like `releaseID` and `graphQuery` are
 * set, they are included in the response to ensure any API requests are
 * properly scoped.
 *
 * @param client Prismic client for the environment's repository.
 *
 * @returns Query options that can be used to query for documents.
 */
export const buildQueryOptions = (
  client: PrismicClient,
): RTE.ReaderTaskEither<Dependencies, never, PrismicClientQueryOptions> =>
  pipe(
    RTE.ask<Dependencies>(),
    RTE.bind('ref', () => getRef(client)),
    RTE.bind('graphQuery', (scope) =>
      RTE.of(
        scope.pluginOptions.graphQuery
          ? { graphQuery: scope.pluginOptions.graphQuery }
          : undefined,
      ),
    ),
    RTE.bind('fetchLinks', (scope) =>
      RTE.of(
        scope.pluginOptions.fetchLinks
          ? { fetchLinks: scope.pluginOptions.fetchLinks }
          : undefined,
      ),
    ),
    RTE.map((scope) => ({
      ref: scope.ref,
      lang: scope.pluginOptions.lang,
      ...scope.graphQuery,
      ...scope.fetchLinks,
    })),
  )

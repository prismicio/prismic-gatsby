import * as prismic from 'ts-prismic'
import * as RTE from 'fp-ts/ReaderTaskEither'
import { pipe } from 'fp-ts/function'

import { Dependencies } from '../types'

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
export const buildQueryParams: RTE.ReaderTaskEither<
  Dependencies,
  Error,
  prismic.QueryParams
> = pipe(
  RTE.ask<Dependencies>(),
  RTE.map((scope) => ({
    accessToken: scope.pluginOptions.accessToken,
    lang: scope.pluginOptions.lang,
    graphQuery: scope.pluginOptions.graphQuery,
    fetchLinks: scope.pluginOptions.fetchLinks,
  })),
)

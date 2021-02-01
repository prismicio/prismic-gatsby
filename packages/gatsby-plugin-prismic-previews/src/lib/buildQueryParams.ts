import * as prismic from 'ts-prismic'
import * as RTE from 'fp-ts/ReaderTaskEither'
import { pipe } from 'fp-ts/function'

export interface BuildQueryParamsEnv {
  accessToken?: string
  graphQuery?: string
  fetchLinks?: string[]
  lang: string
}

/**
 * Build a query params argument for a Prismic request using the environment's
 * plugin options and state. If options like `lang` or `graphQuery` are set,
 * they are included in the response to ensure any API requests are properly
 * scoped.
 *
 * @returns Query params that can be used to query for documents.
 */
export const buildQueryParams: RTE.ReaderTaskEither<
  BuildQueryParamsEnv,
  Error,
  prismic.QueryParams
> = pipe(
  RTE.ask<BuildQueryParamsEnv>(),
  RTE.map((scope) => ({
    accessToken: scope.accessToken,
    lang: scope.lang,
    graphQuery: scope.graphQuery,
    fetchLinks: scope.fetchLinks,
  })),
)

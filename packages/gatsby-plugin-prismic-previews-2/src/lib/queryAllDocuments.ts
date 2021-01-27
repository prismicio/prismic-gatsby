import * as RTE from 'fp-ts/ReaderTaskEither'
import * as TE from 'fp-ts/TaskEither'
import { pipe } from 'fp-ts/function'

import { QUERY_PAGE_SIZE } from '../constants'
import { PrismicAPIDocument } from '../types'

import { createClient, CreateClientEnv, Client } from './createClient'
import {
  buildQueryOptions,
  BuildQueryOptionsEnv,
  QueryOptions,
} from './buildQueryOptions'
import { normalizePrismicError } from './normalizePrismicError'

export type QueryAllDocumentsEnv = CreateClientEnv & BuildQueryOptionsEnv

const aggregateQuery = (
  client: Client,
  queryOptions: QueryOptions,
  page = 1,
  docs: PrismicAPIDocument[] = [],
): TE.TaskEither<Error, PrismicAPIDocument[]> =>
  pipe(
    TE.tryCatch(
      () =>
        client.query([], { ...queryOptions, page, pageSize: QUERY_PAGE_SIZE }),
      (error) => {
        console.log({ error })
        
return normalizePrismicError(error as Error)
      },
    ),
    TE.bind('aggregateResults', (response) =>
      TE.of([...docs, ...response.results]),
    ),
    TE.chain((scope) =>
      page < scope.total_pages
        ? aggregateQuery(client, queryOptions, page + 1, scope.aggregateResults)
        : TE.of(scope.aggregateResults),
    ),
  )

/**
 * Queries all documents from a Prismic repository using the environment's
 * configuration. The following fields from the environment's `pluginOptions`
 * are used, in addition to those used in `createClient`:
 *
 * - `pluginOptions.releaseID`: Prismic Release ID from which to fetch
 *   documents. If not provided, the master ref is used.
 *
 * - `pluginOptions.fetchLinks`: List of document link fields to fetch.
 *
 * - `pluginOptions.lang`: Language of documents to fetch. If not provided, all
 *   languages are fetched.
 *
 * @see gatsby-source-prismic/lib/createClient.ts
 *
 * @returns List of Prismic documents.
 */
export const queryAllDocuments: RTE.ReaderTaskEither<
  QueryAllDocumentsEnv,
  Error,
  PrismicAPIDocument[]
> = pipe(
  RTE.ask<QueryAllDocumentsEnv>(),
  RTE.bindW('client', () => createClient),
  RTE.bindW('queryOptions', (scope) => buildQueryOptions(scope.client)),
  RTE.chain((scope) =>
    RTE.fromTaskEither(aggregateQuery(scope.client, scope.queryOptions)),
  ),
)

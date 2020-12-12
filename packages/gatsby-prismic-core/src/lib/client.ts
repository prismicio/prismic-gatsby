import * as RTE from 'fp-ts/ReaderTaskEither'
import * as T from 'fp-ts/Task'
import * as O from 'fp-ts/Option'
import * as A from 'fp-ts/Array'
import { pipe } from 'fp-ts/function'
import Prismic from 'prismic-javascript'

import {
  Dependencies,
  PrismicClient,
  PrismicClientQueryOptions,
  PrismicDocument,
  ResolveType,
} from '../types'
import { DEFAULT_PRISMIC_API_ENDPOINT, QUERY_PAGE_SIZE } from '../constants'
import { sprintf } from './sprintf'
import { getCookieSafely } from './getCookieSafely'

const buildApiEndpoint = (repositoryName: string): string =>
  sprintf(DEFAULT_PRISMIC_API_ENDPOINT, repositoryName)

const getApi = (
  ...args: Parameters<typeof Prismic.getApi>
): T.Task<PrismicClient> => (): ReturnType<typeof Prismic.getApi> =>
  Prismic.getApi(...args)

const getRef = (
  client: PrismicClient,
): RTE.ReaderTaskEither<Dependencies, never, string> =>
  pipe(
    RTE.ask<Dependencies>(),
    RTE.map((deps) =>
      pipe(
        O.fromNullable(getCookieSafely(Prismic.previewCookie)),
        O.getOrElse(() =>
          pipe(
            O.fromNullable(deps.pluginOptions.releaseID),
            O.chain((releaseId) =>
              pipe(
                client.refs,
                A.findFirst((ref) => ref.id === releaseId),
              ),
            ),
            O.getOrElse(() => client.masterRef),
            (ref) => ref.ref,
          ),
        ),
      ),
    ),
  )

export const queryById = (
  client: PrismicClient,
  id: string,
  queryOptions: PrismicClientQueryOptions,
): T.Task<ResolveType<ReturnType<PrismicClient['getByID']>>> => (): ReturnType<
  typeof client.getByID
> => client.getByID(id, queryOptions)

const queryByIds = (
  client: PrismicClient,
  ids: string[],
  queryOptions: PrismicClientQueryOptions,
): T.Task<ResolveType<ReturnType<PrismicClient['getByIDs']>>> => (): ReturnType<
  typeof client.getByIDs
> => client.getByIDs(ids, queryOptions)

const aggregateQueryByIds = (
  client: PrismicClient,
  ids: string[],
  queryOptions: PrismicClientQueryOptions,
  page = 1,
  docs: PrismicDocument[] = [],
): T.Task<PrismicDocument[]> =>
  pipe(
    queryByIds(client, ids, {
      ...queryOptions,
      page,
      pageSize: QUERY_PAGE_SIZE,
    }),
    T.bind('aggregateResults', (response) =>
      T.of([...docs, ...response.results]),
    ),
    T.chain((scope) =>
      page * QUERY_PAGE_SIZE < scope.total_results_size
        ? aggregateQueryByIds(
            client,
            ids,
            queryOptions,
            page + 1,
            scope.aggregateResults,
          )
        : T.of(scope.aggregateResults),
    ),
  )

const query = (
  client: PrismicClient,
  queryOptions: PrismicClientQueryOptions,
): T.Task<ResolveType<ReturnType<PrismicClient['query']>>> => (): ReturnType<
  typeof client.query
> => client.query([], queryOptions)

const aggregateQuery = (
  client: PrismicClient,
  queryOptions: PrismicClientQueryOptions,
  page = 1,
  docs: PrismicDocument[] = [],
): T.Task<PrismicDocument[]> =>
  pipe(
    query(client, { ...queryOptions, page, pageSize: QUERY_PAGE_SIZE }),
    T.bind('aggregateResults', (response) =>
      T.of([...docs, ...response.results]),
    ),
    T.chain((scope) =>
      page * QUERY_PAGE_SIZE < scope.total_results_size
        ? aggregateQuery(client, queryOptions, page + 1, scope.aggregateResults)
        : T.of(scope.aggregateResults),
    ),
  )

/**
 * Creates a Prismic API client using the environment's configuration. The
 * following fields from the environment's `pluginOptions` are used:
 *
 * - `pluginOptions.apiEndpoint`: Endpoint used to query the Prismic API.
 *
 * - `pluginOptions.repositoryName`: The Prismic repository's name. If
 *   `pluginOptions.apiEndpoint` is not provided, the repository name is used
 *   to construct the default Prismic API V2 endpoint.
 *
 * - `pluginOptions.accessToken`: The Prismic repository's access token. If the
 *   repository's security settings require an access token, this must be
 *   provided.
 *
 * @returns A Prismic API client.
 */
export const createClient = (): RTE.ReaderTaskEither<
  Dependencies,
  never,
  PrismicClient
> =>
  pipe(
    RTE.ask<Dependencies>(),
    RTE.map((deps) =>
      getApi(
        deps.pluginOptions.apiEndpoint ??
          buildApiEndpoint(deps.pluginOptions.repositoryName),
        { accessToken: deps.pluginOptions.accessToken },
      ),
    ),
    RTE.chain((client) => RTE.rightTask(client)),
  )

/**
 * Queries documents in a list of document IDs from a Prismic repository using
 * the environment's configuration. The following fields from the environment's
 * `pluginOptions` are used, in addition to those used in `createClient`:
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
 * @param ref Optional ref used to query all documents (e.g. a ref of a
 * preview). If `ref` is not provided, the ref provided in the
 * environment's plugin options will be used. If the environment's plugin
 * options does not have a ref, the master ref is used.
 *
 * @returns List of Prismic documents.
 */
export const queryDocumentsByIds = (
  ids: string[],
  ref?: string,
): RTE.ReaderTaskEither<Dependencies, never, PrismicDocument[]> =>
  pipe(
    RTE.ask<Dependencies>(),
    RTE.chain((deps) =>
      pipe(
        RTE.right({}),
        RTE.bind('client', createClient),
        RTE.bind('ref', ({ client }) => (ref ? RTE.of(ref) : getRef(client))),
        RTE.map(({ client, ref }) =>
          aggregateQueryByIds(client, ids, {
            ref,
            fetchLinks: deps.pluginOptions.fetchLinks,
            lang: deps.pluginOptions.lang,
          }),
        ),
        RTE.chain((docs) => RTE.fromTask(docs)),
      ),
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
 * @param ref Optional ref used to query all documents (e.g. a ref of a
 * preview). If `ref` is not provided, the ref provided in the
 * environment's plugin options will be used. If the environment's plugin
 * options does not have a ref, the master ref is used.
 *
 * @returns List of Prismic documents.
 */
export const queryAllDocuments = (
  ref?: string,
): RTE.ReaderTaskEither<Dependencies, never, PrismicDocument[]> =>
  pipe(
    RTE.ask<Dependencies>(),
    RTE.chain((deps) =>
      pipe(
        RTE.right({}),
        RTE.bind('client', createClient),
        RTE.bind('ref', ({ client }) => (ref ? RTE.of(ref) : getRef(client))),
        RTE.map(({ client, ref }) =>
          aggregateQuery(client, {
            ref,
            fetchLinks: deps.pluginOptions.fetchLinks,
            lang: deps.pluginOptions.lang,
          }),
        ),
        RTE.chain((docs) => RTE.fromTask(docs)),
      ),
    ),
  )

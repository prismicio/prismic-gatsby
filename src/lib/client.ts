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

const buildApiEndpoint = (repositoryName: string): string =>
  sprintf(DEFAULT_PRISMIC_API_ENDPOINT, repositoryName)

const getApi = (
  ...args: Parameters<typeof Prismic.getApi>
): T.Task<PrismicClient> => () => Prismic.getApi(...args)

const query = (
  client: PrismicClient,
  queryOptions: PrismicClientQueryOptions,
): T.Task<ResolveType<ReturnType<PrismicClient['query']>>> => () =>
  client.query([], queryOptions)

const getRef = (
  client: PrismicClient,
): RTE.ReaderTaskEither<Dependencies, never, string> =>
  pipe(
    RTE.ask<Dependencies>(),
    RTE.map((deps) =>
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
  )

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

export const queryAllDocuments = (): RTE.ReaderTaskEither<
  Dependencies,
  never,
  PrismicDocument[]
> =>
  pipe(
    RTE.ask<Dependencies>(),
    RTE.chain((deps) =>
      pipe(
        RTE.right({}),
        RTE.bind('client', createClient),
        RTE.bind('ref', ({ client }) => getRef(client)),
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

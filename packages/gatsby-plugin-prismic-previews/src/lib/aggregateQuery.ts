import * as prismic from 'ts-prismic'
import * as RTE from 'fp-ts/ReaderTaskEither'
import * as TE from 'fp-ts/TaskEither'
import { pipe } from 'fp-ts/function'
import ky from 'ky'

import { QUERY_PAGE_SIZE } from '../constants'

import { BuildQueryParamsEnv, buildQueryParams } from './buildQueryParams'
import { getRef, GetRefEnv } from './getRef'

export interface AggregateQueryEnv extends GetRefEnv, BuildQueryParamsEnv {}

export const aggregateQuery = (
  predicates: string | string[] | null,
  page = 1,
  docs: prismic.Document[] = [],
): RTE.ReaderTaskEither<AggregateQueryEnv, Error, prismic.Document[]> =>
  pipe(
    RTE.ask<AggregateQueryEnv>(),
    RTE.bindW('ref', () => getRef),
    RTE.bindW('params', () => buildQueryParams),
    RTE.bind('url', (scope) =>
      RTE.of(
        prismic.buildQueryURL(scope.apiEndpoint, scope.ref, predicates, {
          ...scope.params,
          page,
          pageSize: QUERY_PAGE_SIZE,
        }),
      ),
    ),
    RTE.bind('res', (scope) =>
      RTE.fromTaskEither(
        TE.tryCatch(
          () => ky(scope.url).json<prismic.Response.Query>(),
          (error) => error as Error,
        ),
      ),
    ),
    RTE.bind('aggregateResults', (scope) =>
      RTE.of([...docs, ...scope.res.results]),
    ),
    RTE.chain((scope) =>
      page < scope.res.total_pages
        ? aggregateQuery(predicates, page + 1, scope.aggregateResults)
        : RTE.of(scope.aggregateResults),
    ),
  )

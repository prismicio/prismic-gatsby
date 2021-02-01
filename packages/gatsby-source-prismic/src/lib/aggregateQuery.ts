import * as prismic from 'ts-prismic'
import * as RTE from 'fp-ts/ReaderTaskEither'
import * as TE from 'fp-ts/TaskEither'
import { pipe } from 'fp-ts/function'
import got from 'got'

import { Dependencies } from '../types'
import { QUERY_PAGE_SIZE } from '../constants'

import { buildQueryParams } from './buildQueryParams'
import { getRef } from './getRef'

export const aggregateQuery = (
  predicates: string | string[] | null,
  page = 1,
  docs: prismic.Document[] = [],
): RTE.ReaderTaskEither<Dependencies, Error, prismic.Document[]> =>
  pipe(
    RTE.ask<Dependencies>(),
    RTE.bind('ref', () => getRef),
    RTE.bind('params', () => buildQueryParams),
    RTE.bind('url', (scope) =>
      RTE.of(
        prismic.buildQueryURL(
          scope.pluginOptions.apiEndpoint,
          scope.ref,
          predicates,
          { ...scope.params, page, pageSize: QUERY_PAGE_SIZE },
        ),
      ),
    ),
    RTE.bind('res', (scope) =>
      RTE.fromTaskEither(
        TE.tryCatch(
          () => got(scope.url).json() as Promise<prismic.Response.Query>,
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

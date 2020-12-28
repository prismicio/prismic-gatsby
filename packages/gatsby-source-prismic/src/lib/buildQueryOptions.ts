import * as RTE from 'fp-ts/ReaderTaskEither'
import { pipe } from 'fp-ts/function'

import {
  Dependencies,
  PrismicClient,
  PrismicClientQueryOptions,
} from '../types'

import { getRef } from './getRef'

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

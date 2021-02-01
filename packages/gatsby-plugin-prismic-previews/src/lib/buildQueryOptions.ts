import * as RTE from 'fp-ts/ReaderTaskEither'
import { pipe } from 'fp-ts/function'
import { QueryOptions } from 'prismic-javascript/types/ResolvedApi'

import { Client } from './createClient'
import { getRef } from './getRef'

export interface BuildQueryOptionsEnv {
  graphQuery?: string
  fetchLinks?: string[]
  lang: string
}

export { QueryOptions }

export const buildQueryOptions = (
  client: Client,
): RTE.ReaderTaskEither<BuildQueryOptionsEnv, Error, QueryOptions> =>
  pipe(
    RTE.ask<BuildQueryOptionsEnv>(),
    RTE.bind('ref', () => RTE.fromTaskEither(getRef(client))),
    RTE.bind('graphQueryObj', (scope) =>
      RTE.of(scope.graphQuery ? { graphQuery: scope.graphQuery } : undefined),
    ),
    RTE.bind('fetchLinksObj', (scope) =>
      RTE.of(scope.fetchLinks ? { fetchLinks: scope.fetchLinks } : undefined),
    ),
    RTE.map((scope) => ({
      ref: scope.ref,
      lang: scope.lang,
      ...scope.graphQueryObj,
      ...scope.fetchLinksObj,
    })),
  )

import * as RTE from 'fp-ts/ReaderTaskEither'
import * as T from 'fp-ts/Task'
import * as O from 'fp-ts/Option'
import { pipe } from 'fp-ts/function'
import Prismic from 'prismic-javascript'

import { Dependencies, PrismicClient } from '../types'
import { DEFAULT_PRISMIC_API_ENDPOINT } from '../constants'

import { sprintf } from './sprintf'

const buildApiEndpoint = (repositoryName: string): string =>
  sprintf(DEFAULT_PRISMIC_API_ENDPOINT, repositoryName)

const getApi = (
  ...args: Parameters<typeof Prismic.getApi>
): T.Task<PrismicClient> => (): ReturnType<typeof Prismic.getApi> =>
  Prismic.getApi(...args)

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
  Pick<Dependencies, 'pluginOptions'>,
  never,
  PrismicClient
> =>
  pipe(
    RTE.ask<Pick<Dependencies, 'pluginOptions'>>(),
    RTE.chain((deps) =>
      pipe(
        O.fromNullable(deps.pluginOptions.apiEndpoint),
        O.getOrElse(() => buildApiEndpoint(deps.pluginOptions.repositoryName)),
        (apiEndpoint) =>
          getApi(apiEndpoint, { accessToken: deps.pluginOptions.accessToken }),
        (client) => RTE.rightTask(client),
      ),
    ),
  )

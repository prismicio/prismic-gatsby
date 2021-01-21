import * as RTE from 'fp-ts/ReaderTaskEither'
import { pipe } from 'fp-ts/function'
import Prismic from 'prismic-javascript'

import { Dependencies, PrismicClient } from '../types'

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
      RTE.rightTask(() =>
        // TODO: Replace `getApi` with `client`. There shouldn't be a need to
        // eagerly get the API response.
        Prismic.getApi(deps.pluginOptions.apiEndpoint, {
          accessToken: deps.pluginOptions.accessToken,
        }),
      ),
    ),
  )

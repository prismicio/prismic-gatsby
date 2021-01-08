import * as RTE from 'fp-ts/ReaderTaskEither'
import { pipe } from 'fp-ts/function'
import Prismic from 'prismic-javascript'
import { AsyncReturnType } from 'type-fest'

export interface CreateClientEnv {
  apiEndpoint: string
  accessToken: string | null
}

export type Client = AsyncReturnType<typeof Prismic.getApi>

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
  CreateClientEnv,
  never,
  Client
> =>
  pipe(
    RTE.ask<CreateClientEnv>(),
    RTE.chain((env) =>
      RTE.rightTask(() =>
        Prismic.getApi(env.apiEndpoint, {
          accessToken: env.accessToken ?? undefined,
        }),
      ),
    ),
  )

import * as RTE from 'fp-ts/ReaderTaskEither'
import Prismic from 'prismic-javascript'

export interface CreateClientEnv {
  apiEndpoint: string;
  accessToken?: string;
}

export type Client = ReturnType<typeof Prismic.client>

/**
 * Creates a Prismic API client using the environment's configuration. The
 * following fields from the environment's `pluginOptions` are used:
 *
 * - `pluginOptions.apiEndpoint`: Endpoint used to query the Prismic API.
 *
 * - `pluginOptions.accessToken`: The Prismic repository's access token. If the
 *   repository's security settings require an access token, this must be
 *   provided.
 *
 * @returns A Prismic API client.
 */
export const createClient: RTE.ReaderTaskEither<
  CreateClientEnv,
  never,
  Client
> = RTE.asks((env) =>
  Prismic.client(env.apiEndpoint, {
    accessToken: env.accessToken ?? undefined,
  }),
)

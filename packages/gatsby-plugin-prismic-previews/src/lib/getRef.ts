import * as prismic from 'ts-prismic'
import * as RTE from 'fp-ts/ReaderTaskEither'
import * as TE from 'fp-ts/TaskEither'
import * as A from 'fp-ts/Array'
import { pipe } from 'fp-ts/function'
import axios from 'redaxios'
// import ky from 'ky'

import { getCookie } from './getCookie'

export interface GetRefEnv {
  apiEndpoint: string
  accessToken?: string
}

/**
 * Returns the master ref. Requires a network request to fetch the repository's
 * current state.
 */
const getMasterRef: RTE.ReaderTaskEither<GetRefEnv, Error, string> = pipe(
  RTE.ask<GetRefEnv>(),
  RTE.bind('repositoryURL', (env) =>
    RTE.of(prismic.buildRepositoryURL(env.apiEndpoint, env.accessToken)),
  ),
  RTE.bind('repository', (env) =>
    RTE.fromTaskEither(
      TE.tryCatch(
        async () =>
          (await axios(env.repositoryURL)).data as prismic.Response.Repository,
        (error) => error as Error,
      ),
    ),
  ),
  RTE.chainW((env) =>
    pipe(
      env.repository.refs,
      A.findFirst((ref) => ref.isMasterRef),
      RTE.fromOption(() => new Error('Could not find master ref.')),
    ),
  ),
  RTE.map((ref) => ref.ref),
)

/**
 * Returns the Prismic ref for the environment. The ref is determined using the
 * following priority:
 *
 * 1. The environment's Prismic Preview cookie
 * 2. The master ref (i.e. latest ref)
 *
 * @param client A Prismic client for the environment created using `createClient`.
 *
 * @returns The Prismic ref for the environment.
 */
export const getRef: RTE.ReaderTaskEither<GetRefEnv, Error, string> = pipe(
  RTE.fromIOEither(getCookie(prismic.cookie.preview)),
  RTE.orElse(() => getMasterRef),
)

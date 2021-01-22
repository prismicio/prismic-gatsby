import * as cookie from 'es-cookie'
import * as TE from 'fp-ts/TaskEither'
import * as O from 'fp-ts/Option'
import { pipe } from 'fp-ts/function'
import Prismic from 'prismic-javascript'

import { Client } from './createClient'

// Returns the master ref. Requires a network request to fetch the repository's
// current state.
const getMasterRef = (client: Client): TE.TaskEither<Error, string> =>
  pipe(
    TE.tryCatch(
      () => client.getApi(),
      (error) => error as Error,
    ),
    TE.map((x) => x.masterRef.ref),
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
export const getRef = (client: Client): TE.TaskEither<Error, string> =>
  pipe(
    TE.fromIO(() => O.fromNullable(cookie.get(Prismic.previewCookie))),
    TE.chainW(TE.fromOption(() => new Error('No persisted preview ref'))),
    TE.orElse(() => getMasterRef(client)),
  )

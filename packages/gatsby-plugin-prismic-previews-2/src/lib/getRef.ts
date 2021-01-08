import * as cookie from 'es-cookie'
import * as O from 'fp-ts/Option'
import { pipe } from 'fp-ts/function'
import Prismic from 'prismic-javascript'

import { Client } from './createClient'

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
export const getRef = (client: Client): string =>
  pipe(
    O.fromNullable(cookie.get(Prismic.previewCookie)),
    O.getOrElse(() => client.masterRef.ref),
  )

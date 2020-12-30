import * as RTE from 'fp-ts/ReaderTaskEither'
import * as O from 'fp-ts/Option'
import * as A from 'fp-ts/Array'
import { pipe } from 'fp-ts/function'
import { PrismicClient } from 'gatsby-source-prismic'
import Prismic from 'prismic-javascript'

import { Dependencies } from '../types'
import { getCookieSafely } from './getCookieSafely'

/**
 * Returns the Prismic ref for the environment. The ref is determined using the
 * following priority:
 *
 * 1. The environment's Prismic Preview cookie (browser only)
 * 2. The environment's Prismic Release ID
 * 3. The master ref (i.e. latest ref)
 *
 * @param client A Prismic client for the environment created using `createClient`.
 *
 * @returns The Prismic ref for the environment.
 */
export const getRef = (
  client: PrismicClient,
): RTE.ReaderTaskEither<Dependencies, never, string> =>
  pipe(
    RTE.ask<Dependencies>(),
    RTE.map((deps) =>
      pipe(
        O.fromNullable(getCookieSafely(Prismic.previewCookie)),
        O.getOrElse(() =>
          pipe(
            O.fromNullable(deps.pluginOptions.releaseID),
            O.chain((releaseId) =>
              pipe(
                client.refs,
                A.findFirst((ref) => ref.id === releaseId),
              ),
            ),
            O.getOrElse(() => client.masterRef),
            (ref) => ref.ref,
          ),
        ),
      ),
    ),
  )

import * as prismic from 'ts-prismic'
import * as RTE from 'fp-ts/ReaderTaskEither'
import * as TE from 'fp-ts/TaskEither'
import * as O from 'fp-ts/Option'
import * as A from 'fp-ts/Array'
import { pipe } from 'fp-ts/function'
import got from 'got'

import { Dependencies } from '../types'

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
export const getRef: RTE.ReaderTaskEither<Dependencies, Error, string> = pipe(
  RTE.ask<Dependencies>(),
  RTE.bind('repositoryURL', (deps) =>
    RTE.of(
      prismic.buildRepositoryURL(
        deps.pluginOptions.apiEndpoint,
        deps.pluginOptions.accessToken,
      ),
    ),
  ),
  RTE.bind('repository', (scope) =>
    RTE.fromTaskEither(
      TE.tryCatch(
        () => got(scope.repositoryURL).json<prismic.Response.Repository>(),
        (error) => error as Error,
      ),
    ),
  ),
  RTE.bindW('masterRef', (scope) =>
    pipe(
      scope.repository.refs,
      A.findFirst((ref) => ref.isMasterRef),
      RTE.fromOption(() => new Error('Could not find master ref.')),
    ),
  ),
  RTE.map((scope) =>
    pipe(
      O.fromNullable(scope.pluginOptions.releaseID),
      O.chain((releaseID) =>
        pipe(
          scope.repository.refs,
          A.findFirst((ref) => ref.id === releaseID),
        ),
      ),
      O.getOrElse(() => scope.masterRef),
    ),
  ),
  RTE.map((ref) => ref.ref),
)

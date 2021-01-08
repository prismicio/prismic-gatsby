import * as gatsby from 'gatsby'
import * as gatsbyPrismic from 'gatsby-source-prismic'
import * as RTE from 'fp-ts/ReaderTaskEither'
import * as TE from 'fp-ts/TaskEither'
import { pipe } from 'fp-ts/function'
import md5 from 'tiny-hashes/md5'

import { TYPE_PATHS_BASENAME_TEMPLATE } from '../constants'

import { sprintf } from './sprintf'

interface FetchTypePathsStoreEnv {
  repositoryName: string
}

const fetchText = (url: string): TE.TaskEither<Error, string> =>
  pipe(
    TE.tryCatch(
      () => fetch(url),
      (e) => e as Error,
    ),
    TE.chain(
      TE.fromPredicate(
        (res) => res.ok,
        (s) => new Error(s.statusText),
      ),
    ),
    TE.chain((res) =>
      TE.tryCatch(
        () => res.text(),
        (e) => e as Error,
      ),
    ),
  )

const buildTypePathsStoreURL: RTE.ReaderTaskEither<
  FetchTypePathsStoreEnv,
  never,
  string
> = pipe(
  RTE.ask<FetchTypePathsStoreEnv>(),
  RTE.map((env) =>
    md5(sprintf(TYPE_PATHS_BASENAME_TEMPLATE, env.repositoryName)),
  ),
  RTE.map((basename) => gatsby.withAssetPrefix(`/static/${basename}.json`)),
)

export const fetchTypePathsStore: RTE.ReaderTaskEither<
  FetchTypePathsStoreEnv,
  Error,
  gatsbyPrismic.TypePathsStoreInstance
> = pipe(
  RTE.ask<FetchTypePathsStoreEnv>(),
  RTE.bind('url', () => buildTypePathsStoreURL),
  RTE.bind('store', (scope) => RTE.fromTaskEither(fetchText(scope.url))),
  RTE.map((scope) => gatsbyPrismic.deserializeTypePathsStore(scope.store)),
)

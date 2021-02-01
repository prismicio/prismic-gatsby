import * as gatsby from 'gatsby'
import * as RTE from 'fp-ts/ReaderTaskEither'
import * as TE from 'fp-ts/TaskEither'
import { pipe } from 'fp-ts/function'

import {
  BuildTypePathsStoreFilenameEnv,
  buildTypePathsStoreFilename,
} from './buildTypePathsStoreFilename'
import { TypePathsStore } from '../types'

export type FetchTypePathsStoreEnv = BuildTypePathsStoreFilenameEnv

const fetchJSON = <T = unknown>(url: string): TE.TaskEither<Error, T> =>
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
        () => res.json() as Promise<T>,
        (e) => e as Error,
      ),
    ),
  )

const buildTypePathsStoreURL: RTE.ReaderTaskEither<
  BuildTypePathsStoreFilenameEnv,
  never,
  string
> = pipe(
  RTE.ask<BuildTypePathsStoreFilenameEnv>(),
  RTE.chain(() => buildTypePathsStoreFilename),
  RTE.map((filename) => gatsby.withAssetPrefix(`/static/${filename}`)),
)

export const fetchTypePathsStore: RTE.ReaderTaskEither<
  FetchTypePathsStoreEnv,
  Error,
  TypePathsStore
> = pipe(
  RTE.ask<BuildTypePathsStoreFilenameEnv>(),
  RTE.bind('url', () => buildTypePathsStoreURL),
  RTE.chain((scope) =>
    RTE.fromTaskEither(fetchJSON<TypePathsStore>(scope.url)),
  ),
)

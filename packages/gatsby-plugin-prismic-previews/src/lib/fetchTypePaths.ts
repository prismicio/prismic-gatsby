import * as gatsby from 'gatsby'
import * as RTE from 'fp-ts/ReaderTaskEither'
import * as TE from 'fp-ts/TaskEither'
import { pipe } from 'fp-ts/function'
import ky from 'ky'

import {
  BuildTypePathsStoreFilenameEnv,
  buildTypePathsStoreFilename,
} from './buildTypePathsStoreFilename'
import { TypePathsStore } from '../types'

export type FetchTypePathsStoreEnv = BuildTypePathsStoreFilenameEnv

const buildTypePathsStoreURL: RTE.ReaderTaskEither<
  BuildTypePathsStoreFilenameEnv,
  never,
  string
> = pipe(
  RTE.ask<BuildTypePathsStoreFilenameEnv>(),
  RTE.chain(() => buildTypePathsStoreFilename),
  RTE.map((filename) => gatsby.withAssetPrefix(`/static/${filename}`)),
)

export const fetchTypePaths: RTE.ReaderTaskEither<
  FetchTypePathsStoreEnv,
  Error,
  TypePathsStore
> = pipe(
  RTE.ask<BuildTypePathsStoreFilenameEnv>(),
  RTE.bind('url', () => buildTypePathsStoreURL),
  RTE.chain((scope) =>
    RTE.fromTaskEither(
      TE.tryCatch(
        () => ky(scope.url).json<TypePathsStore>(),
        (error) => error as Error,
      ),
    ),
  ),
)

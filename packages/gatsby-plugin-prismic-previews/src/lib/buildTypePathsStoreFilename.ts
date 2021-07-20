import * as RTE from 'fp-ts/ReaderTaskEither'
import { pipe } from 'fp-ts/function'
import md5 from 'tiny-hashes/md5'

import { TYPE_PATHS_BASENAME_TEMPLATE } from '../constants'
import { sprintf } from './sprintf'

export interface BuildTypePathsStoreFilenameEnv {
  repositoryName: string
}

export const buildTypePathsStoreFilename: RTE.ReaderTaskEither<
  BuildTypePathsStoreFilenameEnv,
  never,
  string
> = pipe(
  RTE.asks((env: BuildTypePathsStoreFilenameEnv) =>
    md5(sprintf(TYPE_PATHS_BASENAME_TEMPLATE, env.repositoryName)),
  ),
  RTE.map((basename) => `${basename}.json`),
)

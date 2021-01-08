import * as RTE from 'fp-ts/ReaderTaskEither'
import { pipe } from 'fp-ts/function'

import { Dependencies } from '../types'

import { getFromCache } from './getFromCache'
import { setToCache } from './setToCache'

export const getFromOrSetToCache = <T>(
  key: string,
  f: RTE.ReaderTaskEither<Dependencies, Error, T>,
): RTE.ReaderTaskEither<Dependencies, Error, T> =>
  pipe(
    RTE.ask<Dependencies>(),
    RTE.chain(() => getFromCache<T>(key)),
    RTE.orElse(() => pipe(f, RTE.chainFirstW(setToCache(key)))),
    // RTE.getOrElse(() => pipe(f, RTE.chainFirstW(setToCache(key)), RTE.getOrElse(constVoid))),
    // RTE.orElse(() => pipe(f, RTE.chainW(setToCache(key)))),
  )

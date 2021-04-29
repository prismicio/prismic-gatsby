import * as RTE from 'fp-ts/ReaderTaskEither'
import { pipe } from 'fp-ts/function'

import { Dependencies } from '../types'

import { getFromCache } from './getFromCache'
import { setToCache } from './setToCache'

/**
 * Get value from the cache using a given key. If a value for the given key does not exist, set it with a given value.
 *
 * @param key Key used to get data from the cache.
 * @param f Function to compute the cached value if a value does not already exist.
 *
 * @return Data from the cache with the given key.
 */
export const getFromOrSetToCache = <T>(
  key: string,
  f: RTE.ReaderTaskEither<Dependencies, Error, T>,
): RTE.ReaderTaskEither<Dependencies, Error, T> =>
  pipe(
    RTE.ask<Dependencies>(),
    RTE.chain(() => getFromCache<T>(key)),
    RTE.orElse(() => pipe(f, RTE.chainFirstW(setToCache(key)))),
  )

import * as RTE from 'fp-ts/ReaderTaskEither'
import { pipe } from 'fp-ts/function'

import { Dependencies } from '../types'

export const getFromCache = <T>(
  key: string,
): RTE.ReaderTaskEither<Dependencies, Error, T> =>
  pipe(
    RTE.ask<Dependencies>(),
    RTE.chain((deps) => RTE.fromTask(() => deps.cache.get(key) as Promise<T>)),
    RTE.chainW(
      RTE.fromPredicate(
        (result) => result != null,
        () => new Error('Cache does not contain a value for the given key'),
      ),
    ),
  )

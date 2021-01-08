import * as RTE from 'fp-ts/ReaderTaskEither'
import { pipe } from 'fp-ts/function'

import { Dependencies } from '../types'

export const setToCache = <T>(key: string) => (
  value: T,
): RTE.ReaderTaskEither<Dependencies, never, T> =>
  pipe(
    RTE.ask<Dependencies>(),
    RTE.chain((deps) => RTE.fromTask(() => deps.cache.set(key, value))),
    RTE.map(() => value),
  )

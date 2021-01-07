import * as RTE from 'fp-ts/ReaderTaskEither'
import { pipe, constVoid } from 'fp-ts/function'

import { Dependencies } from '../types'
import { TYPE_PATHS_CACHE_KEY_TEMPLATE } from '../constants'
import { sprintf } from './sprintf'

export const writeTypePathsToCache: RTE.ReaderTaskEither<
  Dependencies,
  never,
  void
> = pipe(
  RTE.ask<Dependencies>(),
  RTE.bind('serializedTypePaths', (scope) =>
    RTE.of(scope.serializeTypePathStore()),
  ),
  RTE.bind('cacheKey', (scope) =>
    RTE.of(
      sprintf(
        TYPE_PATHS_CACHE_KEY_TEMPLATE,
        scope.pluginOptions.repositoryName,
      ),
    ),
  ),
  RTE.chainFirst((scope) =>
    RTE.of(scope.cache.set(scope.cacheKey, scope.serializedTypePaths)),
  ),
  RTE.map(constVoid),
)

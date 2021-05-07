import * as RE from 'fp-ts/ReaderEither'
import * as R from 'fp-ts/Record'
import { pipe } from 'fp-ts/function'

import { UnknownRecord } from '../types'
import {
  proxyDocumentSubtree,
  ProxyDocumentSubtreeEnv,
} from '../lib/proxyDocumentSubtree'
import { mapRecordIndices } from '../lib/mapRecordIndices'

export const valueRefinement = (value: unknown): value is UnknownRecord =>
  typeof value === 'object' && value !== null

export const proxyValue = (
  path: string[],
  fieldValue: UnknownRecord,
): RE.ReaderEither<ProxyDocumentSubtreeEnv, Error, unknown> =>
  pipe(
    RE.ask<ProxyDocumentSubtreeEnv>(),
    RE.chain((env) =>
      pipe(
        fieldValue,
        mapRecordIndices(env.transformFieldName),
        R.mapWithIndex((fieldName, value) =>
          proxyDocumentSubtree([...path, fieldName], value),
        ),
        // @ts-expect-error - fp-ts type mismatch possibly due to conflicting versions
        R.sequence(RE.Applicative),
      ),
    ),
  )

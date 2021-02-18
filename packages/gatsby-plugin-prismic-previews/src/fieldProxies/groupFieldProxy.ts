import * as RE from 'fp-ts/ReaderEither'
import * as A from 'fp-ts/Array'
import { pipe } from 'fp-ts/function'

import { UnknownRecord } from '../types'
import {
  proxyDocumentSubtree,
  ProxyDocumentSubtreeEnv,
} from '../lib/proxyDocumentSubtree'

export const valueRefinement = (value: unknown): value is UnknownRecord[] =>
  Array.isArray(value) &&
  value.every((element) => typeof element === 'object' && element !== null)

export const proxyValue = (
  path: string[],
  fieldValue: UnknownRecord[],
): RE.ReaderEither<ProxyDocumentSubtreeEnv, Error, unknown> =>
  pipe(
    fieldValue,
    A.map((fieldValueElement) => proxyDocumentSubtree(path, fieldValueElement)),
    A.sequence(RE.readerEither),
  )

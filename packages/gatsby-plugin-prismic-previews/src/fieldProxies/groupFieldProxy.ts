import * as RE from 'fp-ts/ReaderEither'
import * as A from 'fp-ts/Array'
import { pipe } from 'fp-ts/function'

import { UnknownRecord } from '../types'
import {
  proxyDocumentSubtree,
  ProxifyDocumentSubtreeEnv,
} from '../lib/proxifyDocumentSubtree'

export const valueRefinement = (value: unknown): value is UnknownRecord[] =>
  Array.isArray(value) &&
  value.every((element) => typeof element === 'object' && element !== null)

export const proxyValue = (
  path: string[],
  fieldValue: UnknownRecord[],
): RE.ReaderEither<ProxifyDocumentSubtreeEnv, Error, unknown> =>
  pipe(
    fieldValue,
    A.map((fieldValueElement) => proxyDocumentSubtree(path, fieldValueElement)),
    A.sequence(RE.readerEither),
  )

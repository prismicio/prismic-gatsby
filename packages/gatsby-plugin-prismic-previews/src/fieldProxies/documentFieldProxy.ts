import * as prismic from 'ts-prismic'
import * as RE from 'fp-ts/ReaderEither'
import { pipe } from 'fp-ts/function'

import {
  proxyDocumentSubtree,
  ProxyDocumentSubtreeEnv,
} from '../lib/proxyDocumentSubtree'

// TODO: This is a poor type guard. It should use something stricter to ensure
// the object is a document.
export const valueRefinement = (value: unknown): value is prismic.Document =>
  typeof value === 'object' && value !== null

export const proxyValue = (
  path: string[],
  fieldValue: prismic.Document,
): RE.ReaderEither<ProxyDocumentSubtreeEnv, Error, unknown> =>
  pipe(
    proxyDocumentSubtree([...path, 'data'], fieldValue.data),
    RE.map((data) => ({
      ...fieldValue,
      data,
    })),
  )

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

// TODO: If a document does not define data fields, we shouldn't process its
// data field because it doesn't exist.
export const proxyValue = (
  path: string[],
  fieldValue: prismic.Document,
): RE.ReaderEither<ProxyDocumentSubtreeEnv, Error, unknown> =>
  pipe(
    RE.ask<ProxyDocumentSubtreeEnv>(),
    RE.bind('data', () =>
      proxyDocumentSubtree([...path, 'data'], fieldValue.data),
    ),
    RE.bind('url', (env) =>
      // This doesn't use `prismic-dom`'s `Link.url` function because this
      // isn't a link. The `Link.url` function includes a check for
      // link-specific fields which produces unwanted results.
      RE.of(env.linkResolver(fieldValue)),
    ),
    RE.map((env) => ({
      ...fieldValue,
      url: env.url,
      data: env.data,
    })),
  )

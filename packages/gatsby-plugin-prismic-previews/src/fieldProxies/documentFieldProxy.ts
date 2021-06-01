import * as prismic from 'ts-prismic'
import * as RE from 'fp-ts/ReaderEither'
import * as R from 'fp-ts/Record'
import { pipe } from 'fp-ts/function'

import {
  proxyDocumentSubtree,
  ProxyDocumentSubtreeEnv,
} from '../lib/proxyDocumentSubtree'

import * as alternativeLanguagesFieldProxy from '../fieldProxies/alternativeLanguagesFieldProxy'

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
      pipe(
        fieldValue.data,
        RE.fromPredicate(
          (data) => !R.isEmpty(data),
          () => new Error('Document does not have a data field'),
        ),
        RE.chain((data) => proxyDocumentSubtree([...path, 'data'], data)),
        RE.orElseW(() => RE.right(fieldValue.data)),
      ),
    ),
    RE.bind('url', (env) =>
      // This doesn't use `prismic-dom`'s `Link.url` function because this
      // isn't a link. The `Link.url` function includes a check for
      // link-specific fields which produces unwanted results.
      // TODO: Once @prismicio/helpers V2 is released, use `documentToLinkField`
      // along with `asLink`
      RE.of(env.linkResolver(fieldValue)),
    ),
    RE.bind('alternative_languages', () =>
      alternativeLanguagesFieldProxy.proxyValue(fieldValue.alternate_languages),
    ),
    RE.map((env) => ({
      ...fieldValue,
      url: env.url,
      alternate_languages: env.alternative_languages,
      data: env.data,
    })),
  )

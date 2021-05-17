/**
 * NOTE: This field proxy is not used like the other field proxies. Because
 * AlternativeLanguages is not a Prismic field type, it is manually handled in
 * `documentFieldProxy`.
 */

import * as gatsbyPrismic from 'gatsby-source-prismic'
import * as RE from 'fp-ts/ReaderEither'
import * as A from 'fp-ts/Array'
import * as O from 'fp-ts/Option'
import { pipe } from 'fp-ts/function'

import { ProxyDocumentSubtreeEnv } from '../lib/proxyDocumentSubtree'
import { createGetProxy } from '../lib/createGetProxy'

const proxyElement = (
  element: gatsbyPrismic.PrismicAPIAlternateLanguageField,
): RE.ReaderEither<
  ProxyDocumentSubtreeEnv,
  Error,
  gatsbyPrismic.PrismicAPIAlternateLanguageField
> =>
  pipe(
    RE.ask<ProxyDocumentSubtreeEnv>(),
    RE.bind('enhancedFieldValue', () =>
      RE.of({
        ...element,
        raw: element,
      }),
    ),
    RE.map((env) =>
      // A Proxy is used here to avoid an infinite loop if documents have
      // circular references in link fields. This effectively makes the
      // `document` field lazy.
      createGetProxy(env.enhancedFieldValue, (target, prop, receiver) =>
        pipe(
          element.id,
          O.fromPredicate(
            (id): id is string => prop === 'document' && typeof id === 'string',
          ),
          O.chain((id) => O.fromNullable(env.getNode(id))),
          O.getOrElseW(() => Reflect.get(target, prop, receiver)),
        ),
      ),
    ),
  )

export const proxyValue = (
  fieldValue: gatsbyPrismic.PrismicAPIAlternateLanguageField[],
): RE.ReaderEither<
  ProxyDocumentSubtreeEnv,
  Error,
  gatsbyPrismic.PrismicAPIAlternateLanguageField[]
> =>
  pipe(
    fieldValue,
    A.map(proxyElement),
    RE.sequenceArray,
    RE.map(
      // This is needed to return a non-readonly Array type.
      (value) => value as gatsbyPrismic.PrismicAPIAlternateLanguageField[],
    ),
  )

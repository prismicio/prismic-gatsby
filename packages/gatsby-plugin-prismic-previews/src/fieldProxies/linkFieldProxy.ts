import * as PrismicDOM from 'prismic-dom'
import * as RE from 'fp-ts/ReaderEither'
import * as O from 'fp-ts/Option'
import { pipe } from 'fp-ts/function'

import * as gatsbyPrismic from '../../../gatsby-source-prismic/src'

import { ProxyDocumentSubtreeEnv } from '../lib/proxyDocumentSubtree'
import { createGetProxy } from '../lib/createGetProxy'

export const valueRefinement = (
  value: unknown,
): value is gatsbyPrismic.PrismicAPILinkField =>
  typeof value === 'object' && value !== null && 'link_type' in value

export const proxyValue = (
  fieldValue: gatsbyPrismic.PrismicAPILinkField,
): RE.ReaderEither<
  ProxyDocumentSubtreeEnv,
  Error,
  gatsbyPrismic.PrismicAPILinkField
> =>
  pipe(
    RE.ask<ProxyDocumentSubtreeEnv>(),
    RE.bind('url', (env) =>
      pipe(
        fieldValue,
        O.fromPredicate(
          (fieldValue) =>
            fieldValue.link_type === 'Document' &&
            typeof fieldValue.id === 'string',
        ),
        O.map((fieldValue) =>
          PrismicDOM.Link.url(fieldValue, env.linkResolver),
        ),
        O.getOrElseW(() => fieldValue.url),
        (url) => RE.of(url),
      ),
    ),
    RE.bind('enhancedFieldValue', (env) =>
      RE.of({
        ...fieldValue,
        url: env.url,
        localFile:
          fieldValue.link_type === 'Media'
            ? {
                publicURL: env.url,
              }
            : null,
        raw: fieldValue,
      }),
    ),
    RE.map((env) =>
      // A Proxy is used here to avoid an infinite loop if documents have
      // circular references in link fields. This effectively makes the
      // `document` field lazy.
      createGetProxy(env.enhancedFieldValue, (target, prop, receiver) =>
        pipe(
          fieldValue.id,
          O.fromPredicate(
            (id): id is string =>
              prop === 'document' &&
              fieldValue.link_type === 'Document' &&
              !fieldValue.isBroken &&
              typeof id === 'string',
          ),
          O.chain((id) => O.fromNullable(env.getNode(id))),
          O.getOrElseW(() => Reflect.get(target, prop, receiver)),
        ),
      ),
    ),
  )

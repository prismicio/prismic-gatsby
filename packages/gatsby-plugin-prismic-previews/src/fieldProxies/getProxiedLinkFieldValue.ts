import * as gatsbyPrismic from 'gatsby-source-prismic'
import * as PrismicDOM from 'prismic-dom'
import * as RE from 'fp-ts/ReaderEither'
import * as O from 'fp-ts/Option'
import { pipe } from 'fp-ts/function'

import { ProxifyDocumentSubtreeEnv } from '../lib/proxifyDocumentSubtree'

export const linkFieldValueRefinement = (
  propValue: unknown,
): propValue is gatsbyPrismic.PrismicAPILinkField =>
  typeof propValue === 'object' &&
  propValue !== null &&
  'link_type' in propValue

export const getProxiedLinkFieldValue = (
  fieldValue: gatsbyPrismic.PrismicAPILinkField,
): RE.ReaderEither<
  ProxifyDocumentSubtreeEnv,
  Error,
  gatsbyPrismic.PrismicAPILinkField
> =>
  pipe(
    RE.ask<ProxifyDocumentSubtreeEnv>(),
    RE.bind('url', (env) =>
      RE.of(PrismicDOM.Link.url(fieldValue, env.linkResolver)),
    ),
    RE.bind('enhancedFieldValue', (env) =>
      RE.of({
        ...fieldValue,
        url: env.url,
        raw: fieldValue,
      }),
    ),
    RE.map(
      (env) =>
        new Proxy(env.enhancedFieldValue, {
          get: (target, prop, receiver): unknown =>
            pipe(
              prop,
              O.fromPredicate(
                (prop) =>
                  prop === 'document' &&
                  fieldValue.link_type === 'Document' &&
                  typeof fieldValue.id === 'string',
              ),
              O.chain(() =>
                O.fromNullable(env.getNode(fieldValue.id as string)),
              ),
              O.getOrElse(() => Reflect.get(target, prop, receiver)),
            ),
        }),
    ),
  )

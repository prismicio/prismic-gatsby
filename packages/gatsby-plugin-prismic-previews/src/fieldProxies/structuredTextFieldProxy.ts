import * as gatsbyPrismic from 'gatsby-source-prismic'
import * as PrismicDOM from 'prismic-dom'
import * as RE from 'fp-ts/ReaderEither'
import { pipe } from 'fp-ts/function'

import { ProxyDocumentSubtreeEnv } from '../lib/proxyDocumentSubtree'

export const valueRefinement = (
  value: unknown,
): value is gatsbyPrismic.PrismicAPIStructuredTextField =>
  Array.isArray(value) && value.every((element) => 'type' in element)

interface StructuredTextProxyValue {
  html: string
  text: string
  raw: gatsbyPrismic.PrismicAPIStructuredTextField
}

export const proxyValue = (
  fieldValue: gatsbyPrismic.PrismicAPIStructuredTextField,
): RE.ReaderEither<ProxyDocumentSubtreeEnv, Error, StructuredTextProxyValue> =>
  pipe(
    RE.ask<ProxyDocumentSubtreeEnv>(),
    RE.bind('html', (env) =>
      RE.of(
        PrismicDOM.RichText.asHtml(
          fieldValue,
          env.linkResolver,
          env.htmlSerializer,
        ),
      ),
    ),
    RE.bind('text', () => RE.of(PrismicDOM.RichText.asText(fieldValue))),
    RE.map((env) => ({
      html: env.html,
      text: env.text,
      raw: fieldValue,
    })),
  )

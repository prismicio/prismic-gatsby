import * as gatsbyPrismic from 'gatsby-source-prismic'
import * as RE from 'fp-ts/ReaderEither'
import * as A from 'fp-ts/Array'
import { pipe } from 'fp-ts/function'

import {
  proxyDocumentSubtree,
  ProxifyDocumentSubtreeEnv,
} from '../lib/proxifyDocumentSubtree'

export const valueRefinement = (
  value: unknown,
): value is gatsbyPrismic.PrismicAPISliceField =>
  typeof value === 'object' && value !== null && 'slice_type' in value

export const proxyValue = (
  path: string[],
  fieldValue: gatsbyPrismic.PrismicAPISliceField,
): RE.ReaderEither<ProxifyDocumentSubtreeEnv, Error, unknown> =>
  pipe(
    RE.ask<ProxifyDocumentSubtreeEnv>(),
    RE.bind('primary', () =>
      proxyDocumentSubtree([...path, 'primary'], fieldValue.primary),
    ),
    RE.bind('items', () =>
      pipe(
        fieldValue.items,
        A.map((item) => proxyDocumentSubtree([...path, 'items'], item)),
        A.sequence(RE.readerEither),
      ),
    ),
    RE.map((env) => ({
      ...fieldValue,
      primary: env.primary,
      items: env.items,
    })),
  )

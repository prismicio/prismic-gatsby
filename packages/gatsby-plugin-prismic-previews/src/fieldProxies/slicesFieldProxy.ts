import * as gatsbyPrismic from 'gatsby-source-prismic'
import * as RE from 'fp-ts/ReaderEither'
import * as A from 'fp-ts/Array'
import { pipe } from 'fp-ts/function'

import {
  proxyDocumentSubtree,
  ProxyDocumentSubtreeEnv,
} from '../lib/proxyDocumentSubtree'

export const valueRefinement = (
  value: unknown,
): value is gatsbyPrismic.PrismicAPISliceField[] =>
  Array.isArray(value) &&
  value.every(
    (element) =>
      typeof element === 'object' &&
      element !== null &&
      'slice_type' in element,
  )

export const proxyValue = (
  path: string[],
  fieldValue: gatsbyPrismic.PrismicAPISliceField[],
): RE.ReaderEither<ProxyDocumentSubtreeEnv, Error, unknown> =>
  pipe(
    fieldValue,
    A.map((fieldValueElement) =>
      proxyDocumentSubtree(
        [...path, fieldValueElement.slice_type],
        fieldValueElement,
      ),
    ),
    RE.sequenceArray,
  )

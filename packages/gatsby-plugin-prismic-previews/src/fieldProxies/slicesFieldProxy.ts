import * as prismicT from '@prismicio/types'
import * as RE from 'fp-ts/ReaderEither'
import * as A from 'fp-ts/Array'
import { pipe } from 'fp-ts/function'

import {
  proxyDocumentSubtree,
  ProxyDocumentSubtreeEnv,
} from '../lib/proxyDocumentSubtree'

export const valueRefinement = (value: unknown): value is prismicT.SliceZone =>
  Array.isArray(value) &&
  value.every(
    (element) =>
      typeof element === 'object' &&
      element !== null &&
      'slice_type' in element,
  )

const sharedSliceValueRefinement = (
  value: prismicT.Slice,
): value is prismicT.SharedSlice => 'variation' in value

export const proxyValue = (
  path: string[],
  fieldValue: prismicT.SliceZone,
): RE.ReaderEither<ProxyDocumentSubtreeEnv, Error, unknown> =>
  pipe(
    fieldValue,
    A.map((fieldValueElement) =>
      sharedSliceValueRefinement(fieldValueElement)
        ? proxyDocumentSubtree(
            [fieldValueElement.slice_type, fieldValueElement.variation],
            fieldValueElement,
          )
        : proxyDocumentSubtree(
            [...path, fieldValueElement.slice_type],
            fieldValueElement,
          ),
    ),
    RE.sequenceArray,
  )

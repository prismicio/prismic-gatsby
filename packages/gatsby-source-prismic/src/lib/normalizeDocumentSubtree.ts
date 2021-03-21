import * as RTE from 'fp-ts/ReaderTaskEither'
import * as R from 'fp-ts/Record'
import * as O from 'fp-ts/Option'
import * as A from 'fp-ts/Array'
import { pipe } from 'fp-ts/function'
import { Stringable } from 'gatsby-node-helpers'

import {
  Dependencies,
  PrismicAPISliceField,
  PrismicFieldType,
  PrismicSpecialType,
  UnknownRecord,
} from '../types'

import { getTypePath } from './getTypePath'
import { createNodeOfType } from './createNodeOfType'

// TODO: Move field-type-specific code to their own files.

interface PrismicAPIEmbedField extends UnknownRecord {
  url: string
}

const unknownRecordRefinement = (value: unknown): value is UnknownRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const unknownRecordArrayValueRefinement = (
  value: unknown,
): value is UnknownRecord[] =>
  Array.isArray(value) && value.every(unknownRecordRefinement)

const embedValueRefinement = (value: unknown): value is PrismicAPIEmbedField =>
  unknownRecordRefinement(value) && 'embed_url' in value

const sliceValueRefinement = (value: unknown): value is PrismicAPISliceField =>
  unknownRecordRefinement(value) && 'slice_type' in value

const stringableRefinement = (value: unknown): value is Stringable =>
  (typeof value === 'boolean' ||
    typeof value === 'number' ||
    typeof value === 'bigint' ||
    typeof value === 'string' ||
    typeof value === 'symbol' ||
    typeof value === 'function' ||
    typeof value === 'object') &&
  value != null &&
  Boolean(value.toString)

const normalizeDocumentRecord = (
  path: string[],
  value: UnknownRecord,
): RTE.ReaderTaskEither<Dependencies, never, UnknownRecord> =>
  pipe(
    value,
    R.mapWithIndex((prop, propValue) =>
      normalizeDocumentSubtree([...path, prop], propValue),
    ),
    R.sequence(RTE.readerTaskEither),
  )

export const normalizeDocumentSubtree = (
  path: string[],
  value: unknown,
): RTE.ReaderTaskEither<Dependencies, never, unknown> =>
  pipe(
    RTE.ask<Dependencies>(),
    RTE.bind('typePath', () => getTypePath(path)),
    RTE.bind('type', (env) => RTE.right(env.typePath.type)),
    RTE.chain((env) => {
      switch (env.typePath.type) {
        case PrismicSpecialType.Document:
        case PrismicSpecialType.DocumentData: {
          return pipe(
            value,
            RTE.fromPredicate(
              unknownRecordRefinement,
              () =>
                new Error(
                  `Field value does not match the type declared in its type path: ${env.type}`,
                ),
            ),
            RTE.chainW((value) => normalizeDocumentRecord(path, value)),
          )
        }

        case PrismicFieldType.Slices:
        case PrismicFieldType.Group: {
          return pipe(
            value,
            RTE.fromPredicate(
              unknownRecordArrayValueRefinement,
              () =>
                new Error(
                  `Field value does not match the type declared in its type path: ${env.type}`,
                ),
            ),
            RTE.map(A.map((item) => normalizeDocumentRecord(path, item))),
            RTE.chainW(RTE.sequenceArray),
          )
        }

        case PrismicFieldType.Slice: {
          return pipe(
            value,
            RTE.fromPredicate(
              sliceValueRefinement,
              () =>
                new Error(
                  `Field value does not match the type declared in its type path: ${env.type}`,
                ),
            ),
            RTE.bindTo('value'),
            RTE.bindW('primary', (scope) =>
              normalizeDocumentRecord(
                [...path, 'primary'],
                scope.value.primary,
              ),
            ),
            RTE.bindW('items', (scope) =>
              pipe(
                scope.value.items,
                A.map((item) =>
                  normalizeDocumentRecord([...path, 'items'], item),
                ),
                RTE.sequenceArray,
              ),
            ),
            RTE.map((scope) => ({
              ...scope.value,
              primary: scope.primary,
              items: scope.items,
            })),
          )
        }

        case PrismicFieldType.Embed: {
          return pipe(
            value,
            RTE.fromPredicate(
              embedValueRefinement,
              () =>
                new Error(
                  `Field value does not match the type declared in its type path: ${env.type}`,
                ),
            ),
            RTE.bindTo('value'),
            RTE.bind('id', (scope) =>
              pipe(
                R.lookup('embed_url', scope.value),
                RTE.fromOption(
                  () => new Error('Embed URL field does not exist'),
                ),
                RTE.filterOrElse(
                  (url): url is string => typeof url === 'string',
                  () => new Error('Embed URL field is not a string'),
                ),
                RTE.map(env.nodeHelpers.createNodeId),
              ),
            ),
            RTE.chainW((scope) =>
              // This type name matches the method used in
              // `buildEmbedFieldConfig`.
              createNodeOfType({ ...scope.value, id: scope.id }, 'EmbedType'),
            ),
            RTE.map((node) => node.id),
          )
        }

        case PrismicFieldType.IntegrationFields: {
          return pipe(
            value,
            RTE.fromPredicate(
              unknownRecordRefinement,
              () => new Error('Field value is not a plain object'),
            ),
            RTE.bindTo('value'),
            RTE.bind('id', (scope) =>
              pipe(
                scope.value,
                R.lookup('id'),
                O.filter(stringableRefinement),
                O.getOrElseW(() => env.createContentDigest(scope.value)),
                (id) => RTE.right(id),
              ),
            ),
            RTE.chainW((scope) =>
              createNodeOfType({ ...scope.value, id: scope.id }, [
                ...path,
                'IntegrationType',
              ]),
            ),
            RTE.map((node) => node.id),
          )
        }

        case PrismicFieldType.Boolean:
        case PrismicFieldType.Color:
        case PrismicFieldType.Date:
        case PrismicFieldType.GeoPoint:
        case PrismicFieldType.Image:
        case PrismicFieldType.Link:
        case PrismicFieldType.Number:
        case PrismicFieldType.Select:
        case PrismicFieldType.StructuredText:
        case PrismicFieldType.Text:
        case PrismicFieldType.Timestamp:
        case PrismicFieldType.UID:
        case PrismicSpecialType.Unknown:
        default: {
          return RTE.throwError(
            new Error('Normalization not necessary for this value.'),
          )
        }
      }
    }),
    // If a normalizer fails or no normalizer exists for the subtree, keep the
    // subtree as is.
    RTE.orElse(() => RTE.right(value)),
  )

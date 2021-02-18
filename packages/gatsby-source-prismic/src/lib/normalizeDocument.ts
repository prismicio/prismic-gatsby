import * as prismic from 'ts-prismic'
import * as RTE from 'fp-ts/ReaderTaskEither'
import * as R from 'fp-ts/Record'
import { pipe } from 'fp-ts/function'

import { Dependencies, PrismicFieldType, UnknownRecord } from '../types'

import { getTypePath } from './getTypePath'
import { createNodeOfType } from './createNodeOfType'

// TODO: Move embed-specific code to their own files.
interface PrismicAPIEmbedField extends UnknownRecord {
  url: string
}

const embedValueRefinement = (value: unknown): value is PrismicAPIEmbedField =>
  typeof value === 'object' &&
  value !== null &&
  !Array.isArray(value) &&
  'url' in value

const normalizeDocumentSubtree = (
  path: string[],
  value: unknown,
): RTE.ReaderTaskEither<Dependencies, Error, unknown> =>
  pipe(
    RTE.ask<Dependencies>(),
    RTE.bind('typePath', () => getTypePath(path)),
    RTE.bind('type', (env) => RTE.of(env.typePath.type)),
    RTE.bind('normalizedValue', (env) => {
      switch (env.typePath.type) {
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
            RTE.bind('url', (scope) =>
              pipe(
                R.lookup('url', scope.value),
                RTE.fromOption(
                  () => new Error('Embed URL field does not exist'),
                ),
                RTE.filterOrElse(
                  (url): url is string => typeof url === 'string',
                  () => new Error('Embed URL field is not a string'),
                ),
              ),
            ),
            RTE.bind('id', (scope) =>
              RTE.of(env.nodeHelpers.createNodeId(scope.url)),
            ),
            RTE.bind('type', () =>
              RTE.of(env.nodeHelpers.createTypeName('EmbedType')),
            ),
            RTE.chainFirstW((scope) =>
              createNodeOfType({ ...scope.value, id: scope.id }, scope.type),
            ),
            RTE.map((scope) => scope.id),
          )
        }

        default: {
          return RTE.throwError(
            new Error('Normalization not necessary for this value.'),
          )
        }
      }
    }),
  )

// TODO: Run normalizeDocumentSubtree on each field of the document. If the
// return value is an `E.right`, replace the field's value with it. If it's
// an `E.left`, keep the value as is - we don't really care about the error.
export const normalizeDocument = (
  doc: prismic.Document,
): RTE.ReaderTaskEither<Dependencies, never, prismic.Document> =>
  pipe(RTE.ask<Dependencies>())

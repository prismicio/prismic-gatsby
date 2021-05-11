import * as RTE from 'fp-ts/ReaderTaskEither'
import * as R from 'fp-ts/Record'
import * as A from 'fp-ts/Array'
import * as S from 'fp-ts/Semigroup'
import { pipe } from 'fp-ts/function'

import { buildObjectType } from '../lib/buildObjectType'
import { getTypeName } from '../lib/getTypeName'
import { createType } from '../lib/createType'
import { createTypePath } from '../lib/createTypePath'

import { buildImageBaseFieldConfigMap } from './buildImageBaseFieldConfigMap'

import {
  Dependencies,
  FieldConfigCreator,
  PrismicFieldType,
  PrismicSchemaImageField,
  PrismicSchemaImageThumbnail,
} from '../types'

/**
 * Creates a GraphQL type containing fields for thumbnails of an Image field.
 *
 * @param path Path to the field.
 * @param schema Schema definition for the field.
 *
 * @returns GraphQL type name for the created type.
 */
// TODO: Move `fields` typename to Dependencies (create in `buildDependencies.ts`).
const createThumbnailsType = (
  path: string[],
  schema: PrismicSchemaImageField,
): RTE.ReaderTaskEither<Dependencies, never, string> =>
  pipe(
    RTE.ask<Dependencies>(),
    RTE.bind('thumbnails', () => RTE.right(schema.config?.thumbnails ?? [])),
    RTE.bind('fields', (scope) =>
      pipe(
        R.fromFoldableMap(S.last<PrismicSchemaImageThumbnail>(), A.Foldable)(
          scope.thumbnails,
          (thumbnail) => [thumbnail.name, thumbnail],
        ),
        R.map(() => scope.nodeHelpers.createTypeName('ImageThumbnailType')),
        (fields) => RTE.right(fields),
      ),
    ),
    RTE.chain((scope) =>
      buildObjectType({
        name: scope.nodeHelpers.createTypeName([
          ...path,
          'ImageThumbnailsType',
        ]),
        fields: scope.fields,
      }),
    ),
    RTE.chainFirst(createType),
    RTE.map(getTypeName),
  )

/**
 * Builds a GraphQL field configuration object for an Image Custom Type field.
 * If the field is configured to have thumbnails, a field-specific type is
 * created for them.
 *
 * This function registers a typepath for the field.
 *
 * @param path Path to the field.
 * @param schema Schema definition for the field.
 *
 * @returns GraphQL field configuration object.
 */
export const buildImageFieldConfig: FieldConfigCreator<PrismicSchemaImageField> =
  (path, schema) =>
    pipe(
      RTE.ask<Dependencies>(),
      RTE.chainFirst(() => createTypePath(path, PrismicFieldType.Image)),
      RTE.bind('thumbnailsTypeName', () =>
        A.isEmpty(schema.config?.thumbnails ?? [])
          ? RTE.right(undefined)
          : createThumbnailsType(path, schema),
      ),
      RTE.bind('baseFields', () => buildImageBaseFieldConfigMap),
      RTE.chain((scope) =>
        buildObjectType({
          name: scope.nodeHelpers.createTypeName([...path, 'ImageType']),
          fields: scope.thumbnailsTypeName
            ? { ...scope.baseFields, thumbnails: scope.thumbnailsTypeName }
            : scope.baseFields,
        }),
      ),
      RTE.chainFirst(createType),
      RTE.map(getTypeName),
    )

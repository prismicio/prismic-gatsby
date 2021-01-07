import * as gatsby from 'gatsby'
import * as RTE from 'fp-ts/ReaderTaskEither'
import * as R from 'fp-ts/Record'
import * as A from 'fp-ts/Array'
import * as S from 'fp-ts/Semigroup'
import { pipe } from 'fp-ts/function'

import { buildObjectType } from '../lib/buildObjectType'
import { getTypeName } from '../lib/getTypeName'
import { registerType } from '../lib/registerType'
import { createTypePath } from '../lib/createTypePath'
import { buildBaseImageFields } from '../lib/buildBaseImageFields'

import {
  Dependencies,
  FieldConfigCreator,
  PrismicFieldType,
  PrismicSchemaImageField,
  PrismicSchemaImageThumbnail,
} from '../types'

const buildThumbnailsType = (
  path: string[],
  schema: PrismicSchemaImageField,
): RTE.ReaderTaskEither<Dependencies, never, gatsby.GatsbyGraphQLObjectType> =>
  pipe(
    RTE.ask<Dependencies>(),
    RTE.bind('thumbnails', () => RTE.of(schema.config?.thumbnails ?? [])),
    RTE.bind('fields', (scope) =>
      pipe(
        R.fromFoldableMap(
          S.getLastSemigroup<PrismicSchemaImageThumbnail>(),
          A.array,
        )(scope.thumbnails, (thumbnail) => [thumbnail.name, thumbnail]),
        R.map(() => scope.nodeHelpers.createTypeName('ImageThumbnailType')),
        (fields) => RTE.of(fields),
      ),
    ),
    RTE.chain((scope) =>
      buildObjectType({
        name: scope.nodeHelpers.createTypeName(...path, 'ImageThumbnailsType'),
        fields: scope.fields,
      }),
    ),
  )

export const createImageFieldConfig: FieldConfigCreator<PrismicSchemaImageField> = (
  path,
  schema,
) =>
  pipe(
    RTE.ask<Dependencies>(),
    RTE.chainFirst(() => createTypePath(path, PrismicFieldType.Image)),
    RTE.bind('imageFields', () => buildBaseImageFields),
    RTE.bind('hasThumbnails', () =>
      RTE.of(A.isNonEmpty(schema.config?.thumbnails ?? [])),
    ),
    RTE.bind('thumbnailsType', (scope) =>
      scope.hasThumbnails
        ? buildThumbnailsType(path, schema)
        : RTE.of(undefined),
    ),
    RTE.bind('thumbnailsTypeName', (scope) =>
      RTE.of(
        scope.thumbnailsType ? getTypeName(scope.thumbnailsType) : undefined,
      ),
    ),
    RTE.chainFirst((scope) =>
      scope.thumbnailsType
        ? registerType(scope.thumbnailsType)
        : RTE.of(void 0),
    ),
    RTE.chain((scope) =>
      buildObjectType({
        name: scope.nodeHelpers.createTypeName(...path, 'ImageType'),
        fields: scope.thumbnailsTypeName
          ? { ...scope.imageFields, thumbnails: scope.thumbnailsTypeName }
          : scope.imageFields,
      }),
    ),
    RTE.chainFirst(registerType),
    RTE.map(getTypeName),
  )

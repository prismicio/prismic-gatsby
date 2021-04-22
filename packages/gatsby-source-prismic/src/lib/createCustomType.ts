import * as gatsby from 'gatsby'
import * as gqlc from 'graphql-compose'
import * as RTE from 'fp-ts/ReaderTaskEither'
import * as R from 'fp-ts/Record'
import * as S from 'fp-ts/Semigroup'
import * as struct from 'fp-ts/struct'
import { pipe } from 'fp-ts/function'

import {
  Dependencies,
  PrismicSchema,
  PrismicSchemaField,
  PrismicAPIDocumentNode,
  PrismicSpecialType,
  PrismicSchemaTab,
} from '../types'
import {
  PREVIEWABLE_NODE_ID_FIELD,
  PRISMIC_API_NON_DATA_FIELDS,
} from '../constants'
import { getTypeName } from './getTypeName'
import { buildObjectType } from './buildObjectType'
import { createType } from './createType'
import { buildFieldConfigMap } from './buildFieldConfigMap'
import { createTypePath } from './createTypePath'

const collectFields = (
  schema: PrismicSchema,
): Record<string, PrismicSchemaField> =>
  pipe(
    schema,
    R.collect((_, value) => value),
    S.concatAll(struct.getAssignSemigroup<PrismicSchemaTab>())({}),
  )

const buildDataFieldConfigMap = (
  customTypeName: string,
  fields: Record<string, PrismicSchemaField>,
): RTE.ReaderTaskEither<
  Dependencies,
  never,
  | gqlc.ObjectTypeComposerFieldConfigMapDefinition<
      PrismicAPIDocumentNode,
      unknown
    >
  | undefined
> =>
  pipe(
    RTE.ask<Dependencies>(),
    RTE.filterOrElse(
      () => !R.isEmpty(fields),
      () => new Error('No data fields in schema'),
    ),
    RTE.chainFirstW(() =>
      createTypePath([customTypeName, 'data'], PrismicSpecialType.DocumentData),
    ),
    RTE.bindW('fieldConfigMap', () =>
      buildFieldConfigMap([customTypeName, 'data'], fields),
    ),
    RTE.chainW((scope) =>
      buildObjectType({
        name: scope.nodeHelpers.createTypeName([customTypeName, 'DataType']),
        fields: scope.fieldConfigMap,
      }),
    ),
    RTE.chainFirstW(createType),
    RTE.map(getTypeName),
    RTE.map((typeName) => ({
      data: typeName,
      dataRaw: {
        type: 'JSON!',
        resolve: (source: PrismicAPIDocumentNode) => source.data,
      },
    })),
    // We will be spreading the return value of this function into the
    // document's config map, so we can return undefined as an empty value.
    // Leaving it as an E.left would have stopped the custom type from being
    // created.
    RTE.orElse(() =>
      RTE.right(
        undefined as
          | gqlc.ObjectTypeComposerFieldConfigMapDefinition<
              PrismicAPIDocumentNode,
              unknown
            >
          | undefined,
      ),
    ),
  )

export const createCustomType = (
  name: string,
  schema: PrismicSchema,
): RTE.ReaderTaskEither<Dependencies, never, gatsby.GatsbyGraphQLObjectType> =>
  pipe(
    RTE.ask<Dependencies>(),
    RTE.bind('fields', () => RTE.right(collectFields(schema))),
    RTE.bind('partitionedFields', (scope) =>
      pipe(
        scope.fields,
        R.partitionWithIndex((i) => PRISMIC_API_NON_DATA_FIELDS.includes(i)),
        (partitionedFields) => RTE.right(partitionedFields),
      ),
    ),
    RTE.bind('rootFieldConfigMap', (scope) =>
      buildFieldConfigMap([name], scope.partitionedFields.right),
    ),
    RTE.bind('dataFieldConfigMap', (scope) =>
      buildDataFieldConfigMap(name, scope.partitionedFields.left),
    ),
    RTE.chain((scope) =>
      buildObjectType({
        name: scope.nodeHelpers.createTypeName(name),
        fields: {
          ...scope.rootFieldConfigMap,
          ...scope.dataFieldConfigMap,
          [scope.nodeHelpers.createFieldName('id') as 'id']: 'ID!',
          first_publication_date: {
            type: 'Date!',
            extensions: { dateformat: {} },
          },
          href: 'String!',
          lang: 'String!',
          last_publication_date: {
            type: 'Date!',
            extensions: { dateformat: {} },
          },
          tags: '[String!]!',
          type: 'String!',
          url: {
            type: 'String',
            resolve: (source: PrismicAPIDocumentNode) =>
              scope.pluginOptions.linkResolver?.(source),
          },
          [PREVIEWABLE_NODE_ID_FIELD]: {
            type: 'ID!',
            resolve: (source: PrismicAPIDocumentNode) =>
              source[scope.nodeHelpers.createFieldName('id')],
          },
        },
        interfaces: ['Node'],
        extensions: { infer: false },
      }),
    ),
    RTE.chainFirst(createType),
    RTE.chainFirst(() => createTypePath([name], PrismicSpecialType.Document)),
  )

import * as gatsby from 'gatsby'
import * as RTE from 'fp-ts/ReaderTaskEither'
import * as R from 'fp-ts/Record'
import * as A from 'fp-ts/Array'
import { pipe, flow, identity } from 'fp-ts/function'

import { buildObjectType } from '../lib/buildObjectType'
import { buildSchemaRecordType } from '../lib/buildSchemaRecordType'
import { buildUnionType } from '../lib/buildUnionType'
import { getTypeName } from '../lib/getTypeName'
import { listTypeName } from '../lib/listTypeName'
import { registerType } from '../lib/registerType'
import { registerTypes } from '../lib/registerTypes'
import { createTypePath } from '../lib/createTypePath'

import {
  Dependencies,
  FieldConfigCreator,
  PrismiaSchemaSlice,
  PrismicAPISliceField,
  PrismicFieldType,
  PrismicSchemaSlicesField,
} from '../types'

const buildSliceChoiceType = (
  path: string[],
  schema: PrismiaSchemaSlice,
): RTE.ReaderTaskEither<Dependencies, never, gatsby.GatsbyGraphQLObjectType> =>
  pipe(
    RTE.ask<Dependencies>(),
    RTE.chainFirst(() => createTypePath(path, PrismicFieldType.Slice)),
    RTE.chain((deps) =>
      pipe(
        {} as Record<
          'primary' | 'items',
          RTE.ReaderTaskEither<
            Dependencies,
            never,
            gatsby.GatsbyGraphQLObjectType
          >
        >,
        R.isEmpty(schema['non-repeat'])
          ? identity
          : R.insertAt(
              'primary',
              buildSchemaRecordType([...path, 'primary'], schema['non-repeat']),
            ),
        R.isEmpty(schema.repeat)
          ? identity
          : R.insertAt(
              'items',
              buildSchemaRecordType([...path, 'items'], schema.repeat),
            ),
        R.sequence(RTE.readerTaskEither),
        RTE.chainFirst(
          flow(
            R.collect((_, type) => type),
            registerTypes,
          ),
        ),
        RTE.map(
          R.mapWithIndex((field, type) =>
            field === 'items'
              ? pipe(type, getTypeName, listTypeName)
              : getTypeName(type),
          ),
        ),
        RTE.chain((fields) =>
          buildObjectType({
            name: deps.nodeHelpers.createTypeName(...path),
            fields: {
              ...fields,
              slice_type: 'String!',
              slice_label: 'String',
            },
            extensions: { infer: false },
          }),
        ),
      ),
    ),
  )

const buildSliceTypes = (
  path: string[],
  choices: Record<string, PrismiaSchemaSlice>,
): RTE.ReaderTaskEither<
  Dependencies,
  never,
  gatsby.GatsbyGraphQLObjectType[]
> =>
  pipe(
    choices,
    R.mapWithIndex((sliceName, sliceSchema) =>
      buildSliceChoiceType(A.snoc(path, sliceName), sliceSchema),
    ),
    R.sequence(RTE.readerTaskEither),
    RTE.map(R.collect((_, type) => type)),
  )

export const createSlicesFieldConfig: FieldConfigCreator<PrismicSchemaSlicesField> = (
  path,
  schema,
) =>
  pipe(
    RTE.ask<Dependencies>(),
    RTE.chainFirst(() => createTypePath(path, PrismicFieldType.Slices)),
    RTE.chain((deps) =>
      pipe(
        buildSliceTypes(path, schema.config.choices),
        RTE.chainFirst(registerTypes),
        RTE.map(A.map(getTypeName)),
        RTE.chain((types) =>
          buildUnionType({
            name: deps.nodeHelpers.createTypeName(...path, 'SlicesType'),
            types,
            resolveType: (source: PrismicAPISliceField) =>
              deps.nodeHelpers.createTypeName(...path, source.slice_type),
          }),
        ),
        RTE.chainFirst(registerType),
        RTE.map(getTypeName),
        RTE.map(listTypeName),
      ),
    ),
  )

import * as gatsby from 'gatsby'
import * as prismicT from '@prismicio/types'
import * as RTE from 'fp-ts/ReaderTaskEither'
import * as R from 'fp-ts/Record'
import * as A from 'fp-ts/Array'
import * as ReadonlyA from 'fp-ts/ReadonlyArray'
import * as E from 'fp-ts/Either'
import * as O from 'fp-ts/Option'
import { pipe, flow, identity } from 'fp-ts/function'

import { buildObjectType } from '../lib/buildObjectType'
import { buildSchemaRecordType } from '../lib/buildSchemaRecordType'
import { buildUnionType } from '../lib/buildUnionType'
import { getTypeName } from '../lib/getTypeName'
import { listTypeName } from '../lib/listTypeName'
import { createType } from '../lib/createType'
import { createTypes } from '../lib/createTypes'
import { createTypePath } from '../lib/createTypePath'
import { requiredTypeName } from '../lib/requiredTypeName'

import {
  Dependencies,
  FieldConfigCreator,
  TypePathKind,
  UnknownRecord,
} from '../types'

/**
 * Builds a GraphQL field configuration object for a Slice zone's Slice. Both
 * `non-repeat` and `repeat` schemas will be converted to GraphQL field
 * configuration objects. The resulting type can be created using Gatsby's
 * `createTypes` action.
 *
 * This function registers a typepath for the field.
 *
 * @param path Path to the Slice zone.
 * @param model Schema definition for the Slice.
 *
 * @returns GraphQL object type.
 */
const buildSliceType = (
  path: string[],
  model: prismicT.CustomTypeModelSlice,
): RTE.ReaderTaskEither<Dependencies, Error, gatsby.GatsbyGraphQLObjectType> =>
  pipe(
    RTE.ask<Dependencies>(),
    RTE.chainFirst(() =>
      createTypePath(
        TypePathKind.Field,
        path,
        prismicT.CustomTypeModelSliceType.Slice,
      ),
    ),
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
        R.isEmpty(model['non-repeat'])
          ? identity
          : R.upsertAt(
              'primary',
              buildSchemaRecordType([...path, 'primary'], model['non-repeat']),
            ),
        R.isEmpty(model.repeat)
          ? identity
          : R.upsertAt(
              'items',
              buildSchemaRecordType([...path, 'items'], model.repeat, [
                ...path,
                'item',
              ]),
            ),
        R.sequence(RTE.ApplicativeSeq),
        RTE.chainFirstW(
          flow(
            R.collect((_, type) => type),
            createTypes,
          ),
        ),
        RTE.map(
          R.mapWithIndex((field, type) =>
            field === 'items'
              ? pipe(
                  type,
                  getTypeName,
                  requiredTypeName,
                  listTypeName,
                  requiredTypeName,
                )
              : pipe(type, getTypeName, requiredTypeName),
          ),
        ),
        RTE.chainW((fields) =>
          buildObjectType({
            name: deps.nodeHelpers.createTypeName(path),
            fields: {
              ...fields,
              id: {
                type: 'ID!',
                resolve: (source: UnknownRecord): string =>
                  deps.nodeHelpers.createNodeId([
                    ...path,
                    deps.createContentDigest(source),
                  ]),
              },
              slice_type: 'String!',
              slice_label: 'String',
            },
            interfaces: [deps.globalNodeHelpers.createTypeName('SliceType')],
            extensions: { infer: false },
          }),
        ),
      ),
    ),
  )

/**
 * Builds GraphQL types for Slice Custom Type fields. The resulting types can
 * be created using Gatsby's `createTypes` action.
 *
 * @param path Path to the fields.
 * @param choices Record of Slice choices mapping a Slice API ID to its schema definition.
 *
 * @returns List of GraphQL types for the provided Slice schemas.
 */
const buildSliceTypes = (
  path: string[],
  choices: prismicT.CustomTypeModelSliceZoneField['config']['choices'],
): RTE.ReaderTaskEither<Dependencies, Error, string[]> =>
  pipe(
    RTE.ask<Dependencies>(),
    RTE.bindW('sliceModels', () =>
      pipe(
        choices,
        R.filter(
          (slice): slice is prismicT.CustomTypeModelSlice =>
            slice.type === prismicT.CustomTypeModelSliceType.Slice,
        ),
        RTE.right,
      ),
    ),
    RTE.bindW('sliceTypeNames', (scope) =>
      pipe(
        scope.sliceModels,
        R.mapWithIndex((sliceName, sliceModel) =>
          buildSliceType([...path, sliceName], sliceModel),
        ),
        R.sequence(RTE.ApplicativeSeq),
        RTE.map(R.collect((_, type) => type)),
        RTE.chainFirstW(createTypes),
        RTE.map(A.map(getTypeName)),
      ),
    ),
    RTE.bindW('sharedSliceModels', () =>
      pipe(
        choices,
        R.filter(
          (slice): slice is prismicT.CustomTypeModelSharedSlice =>
            slice.type === prismicT.CustomTypeModelSliceType.SharedSlice,
        ),
        RTE.right,
      ),
    ),
    RTE.bindW('sharedSliceTypesNames', (scope) =>
      pipe(
        scope.sharedSliceModels,
        R.keys,
        A.map((sharedSliceId) =>
          pipe(
            scope.pluginOptions.sharedSliceModels,
            A.findFirst(
              (sharedSliceModel) => sharedSliceModel.id === sharedSliceId,
            ),
            E.fromOption(
              () =>
                new Error(
                  `Could not find a Shared Slice model for a Shared Slice named "${sharedSliceId}"`,
                ),
            ),
          ),
        ),
        A.sequence(E.Applicative),
        RTE.fromEither,
        RTE.map(
          A.map((sharedSliceModel) =>
            pipe(
              sharedSliceModel.variations,
              ReadonlyA.map((variation) =>
                scope.nodeHelpers.createTypeName([
                  sharedSliceModel.id,
                  variation.id,
                ]),
              ),
            ),
          ),
        ),
        RTE.map(ReadonlyA.flatten),
        RTE.map(ReadonlyA.toArray),
      ),
    ),
    RTE.map((scope) => [
      ...scope.sliceTypeNames,
      ...scope.sharedSliceTypesNames,
    ]),
  )

/**
 * Builds a GraphQL field configuration object for a Slices Custom Type field
 * (also known as a Slice zone). The resulting configuration object can be used
 * in a GraphQL type.
 *
 * This function registers a typepath for the field.
 *
 * @param path Path to the field.
 * @param schema Schema definition for the field.
 *
 * @returns GraphQL field configuration object.
 */
export const buildSlicesFieldConfig: FieldConfigCreator<prismicT.CustomTypeModelSliceZoneField> =
  (path, schema) =>
    pipe(
      RTE.ask<Dependencies>(),
      RTE.chainFirst(() =>
        createTypePath(
          TypePathKind.Field,
          path,
          prismicT.CustomTypeModelFieldType.Slices,
        ),
      ),
      RTE.chain((deps) =>
        pipe(
          buildSliceTypes(path, schema.config.choices),
          RTE.chainW((types) =>
            buildUnionType({
              name: deps.nodeHelpers.createTypeName([...path, 'SlicesType']),
              types,
              resolveType: (source: prismicT.Slice | prismicT.SharedSlice) =>
                pipe(
                  source,
                  O.fromPredicate(
                    (source): source is prismicT.SharedSlice =>
                      'variation' in source,
                  ),
                  O.map((source) =>
                    deps.nodeHelpers.createTypeName([
                      source.slice_type,
                      source.variation,
                    ]),
                  ),
                  O.getOrElse(() =>
                    deps.nodeHelpers.createTypeName([
                      ...path,
                      source.slice_type,
                    ]),
                  ),
                ),
            }),
          ),
          RTE.chainFirstW(createType),
          RTE.map(
            flow(getTypeName, requiredTypeName, listTypeName, requiredTypeName),
          ),
        ),
      ),
    )

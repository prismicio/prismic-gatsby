import * as gatsby from 'gatsby'
import * as prismicT from '@prismicio/types'
import * as RTE from 'fp-ts/ReaderTaskEither'
import * as R from 'fp-ts/Record'
import * as ReadonlyA from 'fp-ts/ReadonlyArray'
import { pipe, flow, identity } from 'fp-ts/function'

import { buildObjectType } from '../lib/buildObjectType'
import { buildSchemaRecordType } from '../lib/buildSchemaRecordType'
import { getTypeName } from '../lib/getTypeName'
import { listTypeName } from '../lib/listTypeName'
import { createTypes } from '../lib/createTypes'
import { createTypePath } from '../lib/createTypePath'

import {
  Dependencies,
  Mutable,
  PrismicSpecialType,
  TypePathKind,
  UnknownRecord,
} from '../types'

/**
 * @returns GraphQL object type.
 */
export const buildSharedSliceVariationType = (
  path: string[],
  variationModel: prismicT.SharedSliceModelVariation,
): RTE.ReaderTaskEither<Dependencies, never, gatsby.GatsbyGraphQLObjectType> =>
  pipe(
    RTE.ask<Dependencies>(),
    RTE.chainFirst(() =>
      createTypePath(
        TypePathKind.SharedSlice,
        path,
        PrismicSpecialType.SharedSliceVariation,
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
        R.isEmpty(variationModel.primary)
          ? identity
          : R.upsertAt(
              'primary',
              buildSchemaRecordType(
                [...path, 'primary'],
                variationModel.primary,
              ),
            ),
        R.isEmpty(variationModel.items)
          ? identity
          : R.upsertAt(
              'items',
              buildSchemaRecordType([...path, 'items'], variationModel.items, [
                ...path,
                'item',
              ]),
            ),
        R.sequence(RTE.ApplicativeSeq),
        RTE.chainFirst(
          flow(
            R.collect((_, type) => type),
            createTypes,
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
              version: 'String!',
              variation: 'String!',
            },
            interfaces: [
              deps.globalNodeHelpers.createTypeName('SliceType'),
              deps.globalNodeHelpers.createTypeName('SharedSliceType'),
            ],
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
export const buildSharedSliceVariationTypes = (
  path: string[],
  variations: prismicT.SharedSliceModel['variations'],
): RTE.ReaderTaskEither<
  Dependencies,
  never,
  gatsby.GatsbyGraphQLObjectType[]
> =>
  pipe(
    variations,
    ReadonlyA.map((variation) =>
      buildSharedSliceVariationType([...path, variation.id], variation),
    ),
    RTE.sequenceArray,
    RTE.map((types) => types as Mutable<typeof types>),
  )

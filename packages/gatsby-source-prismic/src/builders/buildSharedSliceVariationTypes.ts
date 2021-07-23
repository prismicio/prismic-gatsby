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
  UnknownRecord,
} from '../types'
import { requiredTypeName } from '../lib/requiredTypeName'

/**
 * @returns GraphQL object type.
 */
export const buildSharedSliceVariationType = (
  path: string[],
  variationModel: prismicT.SharedSliceModelVariation,
): RTE.ReaderTaskEither<Dependencies, Error, gatsby.GatsbyGraphQLObjectType> =>
  pipe(
    RTE.ask<Dependencies>(),
    RTE.chainFirst(() =>
      createTypePath(
        [...path, variationModel.id],
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
                [...path, variationModel.id, 'primary'],
                variationModel.primary,
              ),
            ),
        R.isEmpty(variationModel.items)
          ? identity
          : R.upsertAt(
              'items',
              buildSchemaRecordType(
                [...path, variationModel.id, 'items'],
                variationModel.items,
              ),
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
              ? pipe(type, getTypeName, listTypeName, requiredTypeName)
              : pipe(type, getTypeName, requiredTypeName),
          ),
        ),
        RTE.chainW((fields) =>
          buildObjectType({
            name: deps.nodeHelpers.createTypeName([...path, variationModel.id]),
            fields: {
              ...fields,
              id: {
                type: 'ID!',
                resolve: (source: UnknownRecord): string =>
                  deps.nodeHelpers.createNodeId([
                    ...path,
                    variationModel.id,
                    deps.createContentDigest(source),
                  ]),
              },
              slice_type: 'String!',
              slice_label: 'String',
              version: 'String!',
              variation: 'String!',
              // variation: pipe(
              //   deps.nodeHelpers.createTypeName([...path, 'Variation']),
              //   requiredTypeName,
              // ),
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
 * Builds GraphQL types for a Shared Slice's variations. The resulting types
 * can be created using Gatsby's `createTypes` action.
 *
 * @param path Path to the Shared Slice.
 * @param variations List of Shared Slice variations.
 *
 * @returns List of GraphQL types for each Shared Slice variation.
 */
export const buildSharedSliceVariationTypes = (
  path: string[],
  variations: prismicT.SharedSliceModel['variations'],
): RTE.ReaderTaskEither<
  Dependencies,
  Error,
  gatsby.GatsbyGraphQLObjectType[]
> =>
  pipe(
    RTE.right(variations),
    RTE.map(
      ReadonlyA.map((variation) =>
        buildSharedSliceVariationType(path, variation),
      ),
    ),
    RTE.chain(RTE.sequenceArray),
    RTE.map((types) => types as Mutable<typeof types>),
  )

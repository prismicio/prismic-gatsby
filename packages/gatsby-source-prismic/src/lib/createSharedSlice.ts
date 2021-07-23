import * as gatsby from 'gatsby'
import * as prismicT from '@prismicio/types'
import * as RTE from 'fp-ts/ReaderTaskEither'
import * as A from 'fp-ts/Array'
import * as O from 'fp-ts/Option'
import { pipe } from 'fp-ts/function'

import { Dependencies } from '../types'
import { buildSharedSliceVariationTypes } from '../builders/buildSharedSliceVariationTypes'
import { createTypes } from './createTypes'
import { getTypeName } from './getTypeName'
import { buildUnionType } from './buildUnionType'

export const createSharedSlice = (
  sharedSliceModel: prismicT.SharedSliceModel,
): RTE.ReaderTaskEither<Dependencies, Error, gatsby.GatsbyGraphQLUnionType> =>
  pipe(
    RTE.ask<Dependencies>(),
    RTE.bind('variationTypes', () =>
      pipe(
        buildSharedSliceVariationTypes(
          [sharedSliceModel.id],
          sharedSliceModel.variations,
        ),
        RTE.chainFirstW(createTypes),
        RTE.map(A.map(getTypeName)),
      ),
    ),
    RTE.chainW((scope) =>
      buildUnionType({
        name: scope.nodeHelpers.createTypeName([sharedSliceModel.id]),
        types: scope.variationTypes,
        resolveType: (source: prismicT.Slice | prismicT.SharedSlice) =>
          pipe(
            source,
            O.fromPredicate(
              (source): source is prismicT.SharedSlice => 'variation' in source,
            ),
            O.map((source) =>
              scope.nodeHelpers.createTypeName([
                source.slice_type,
                source.variation,
              ]),
            ),
            O.getOrElse(() =>
              scope.nodeHelpers.createTypeName([
                sharedSliceModel.id,
                source.slice_type,
              ]),
            ),
          ),
      }),
    ),
  )

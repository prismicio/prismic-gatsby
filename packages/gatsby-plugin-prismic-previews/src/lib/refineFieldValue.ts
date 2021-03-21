import * as RE from 'fp-ts/ReaderEither'
import { Refinement } from 'fp-ts/function'

import * as gatsbyPrismic from '../../../gatsby-source-prismic/src'

import { FIELD_VALUE_TYPE_PATH_MISMATCH_MSG } from '../constants'
import { sprintf } from './sprintf'

export const refineFieldValue = <A, B extends A>(
  refinement: Refinement<A, B>,
  intendedType: gatsbyPrismic.PrismicTypePathType,
) =>
  RE.fromPredicate(
    refinement,
    () => new Error(sprintf(FIELD_VALUE_TYPE_PATH_MISMATCH_MSG, intendedType)),
  )

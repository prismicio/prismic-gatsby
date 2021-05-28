import * as gatsbyPrismic from 'gatsby-source-prismic'
import * as RE from 'fp-ts/ReaderEither'
import { Refinement } from 'fp-ts/function'

import { FIELD_VALUE_TYPE_PATH_MISMATCH_MSG } from '../constants'
import { sprintf } from './sprintf'
import { dotPath } from './dotPath'

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const refineFieldValue = <A, B extends A>(
  refinement: Refinement<A, B>,
  intendedType: gatsbyPrismic.PrismicTypePathType,
  path: string[],
) =>
  RE.fromPredicate(
    refinement,
    () =>
      new Error(
        sprintf(
          FIELD_VALUE_TYPE_PATH_MISMATCH_MSG,
          dotPath(path),
          intendedType,
        ),
      ),
  )
